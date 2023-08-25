import {
  Address,
  Asset,
  Contract,
  Operation,
  Server,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
} from "soroban-client";
import { NetworkDetails } from "./network";
import { ERRORS } from "./error";

export const SendTxStatus: {
  [index: string]: SorobanRpc.SendTransactionStatus;
} = {
  Pending: "PENDING",
  Duplicate: "DUPLICATE",
  Retry: "TRY_AGAIN_LATER",
  Error: "ERROR",
};

export const GetTxStatus: {
  [index: string]: SorobanRpc.GetTransactionStatus;
} = {
  // @ts-ignore
  Success: "SUCCESS",
  // @ts-ignore
  NotFound: "NOT_FOUND",
  // @ts-ignore
  Failed: "FAILED",
};

export const RPC_URLS: { [key: string]: string } = {
  FUTURENET: "https://rpc-futurenet.stellar.org/",
  STANDALONE: "http://127.0.0.1:8000/soroban/rpc",
};

export const accountToScVal = (account: string) =>
  new Address(account).toScVal();

export const getServer = (networkDetails: NetworkDetails) =>
  new Server(RPC_URLS[networkDetails.network], {
    allowHttp: networkDetails.networkUrl.startsWith("http://"),
  });

export const getEstimatedFee = async (
  contractAddress: string,
  memberPubKey: string,
  txBuilder: TransactionBuilder,
  server: Server,
) => {
  const contract = new Contract(contractAddress);
  const tx = txBuilder
    .addOperation(
      contract.call(
        "signup",
        ...[
          accountToScVal(memberPubKey), // member
        ],
      ),
    )
    .setTimeout(TimeoutInfinite);

  const builtTransaction = tx.build();
  console.log("built transaction", builtTransaction.toXDR());

  const simResponse = await server.simulateTransaction(builtTransaction);
  console.log("simulation response:", simResponse);
  if (simResponse.error) {
    throw simResponse.error;
  }

  // if (!simResponse.result || simResponse.result.length < 1)
  const classicFeeNum = parseInt(builtTransaction.fee, 10) || 0;
  const minResourceFeeNum = parseInt(simResponse.minResourceFee, 10) || 0;
  const fee = (classicFeeNum + minResourceFeeNum).toString();
  return fee;
};

export const getTxBuilder = async (
  pubKey: string,
  fee: string,
  server: Server,
  networkPassphrase: string,
) => {
  const source = await server.getAccount(pubKey);
  return new TransactionBuilder(source, {
    fee,
    networkPassphrase,
  });
};

// build a change trust transaction, and prepare the corresponding xdr
export const changeTrustTransaction = ({
  tokenIssuer,
  tokenSymbol,
  limit,
  txBuilder,
}: {
  tokenIssuer: string;
  tokenSymbol: string;
  limit?: string;
  txBuilder: TransactionBuilder;
}) => {
  try {
    const transaction = txBuilder
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(tokenSymbol, tokenIssuer),
          limit: limit !== "" ? limit : undefined,
        }),
      )
      .setTimeout(TimeoutInfinite);

    const builtTransaction = transaction.build();
    return builtTransaction.toXDR();
  } catch (error) {
    console.log("error in soroban.ts changeTrustTransaction()", error);
    return "error";
  }
};

export const signupTransaction = async ({
  contractAddress,
  memberPubKey,
  txBuilder,
  server,
  networkPassphrase,
}: {
  contractAddress: string;
  memberPubKey: string;
  txBuilder: TransactionBuilder;
  server: Server;
  networkPassphrase: string;
}) => {
  const contract = new Contract(contractAddress);

  try {
    const tx = txBuilder
      .addOperation(
        contract.call(
          "signup",
          ...[
            accountToScVal(memberPubKey), // member
          ],
        ),
      )
      .setTimeout(TimeoutInfinite);

    const preparedTransaction = await server.prepareTransaction(
      tx.build(),
      networkPassphrase,
    );

    return preparedTransaction.toXDR();
  } catch (error) {
    console.log("error in soroban.ts signupTransaction()", error);
    return "error";
  }
};

export const submitTransaction = async (
  signedXDR: string,
  networkPassphrase: string,
  server: Server,
) => {
  const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.errorResultXdr) {
    throw new Error(ERRORS.UnableToSubmitTx);
  }

  if (sendResponse.status === "PENDING") {
    let txResponse = await server.getTransaction(sendResponse.hash);

    // Poll this until the status is not "NOT_FOUND"
    while (txResponse.status === "NOT_FOUND") {
      // See if the transaction is complete
      // eslint-disable-next-line no-await-in-loop
      txResponse = await server.getTransaction(sendResponse.hash);
      // wait a second
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (txResponse.status === "SUCCESS") {
      return txResponse.resultXdr.toXDR('base64');
    }

    throw new Error(
      `Transaction submission failed: ${txResponse.status}`,
    );
    // eslint-disable-next-line no-else-return
  } else {
    throw new Error(
      `Unable to submit transaction, status: ${sendResponse.status}`,
    );
  }
};
