import React from "react";
import { Button, Heading, Profile } from "@stellar/design-system";
import { StellarWalletsKit } from "stellar-wallets-kit";

import { NetworkDetails, signTx } from "../../helpers/network";
import {
  changeTrustTransaction,
  getServer,
  getTxBuilder,
  signupTransaction,
} from "../../helpers/soroban";
import { ERRORS } from "../../helpers/error";

interface ConfirmTxProps {
  tokenIssuer?: string;
  tokenSymbol?: string;
  limit?: string;
  contractAddress?: string;
  memberAddress?: string;
  fee: string;
  pubKey: string;
  kit: StellarWalletsKit;
  onTxSign: (xdr: string) => void;
  networkDetails: NetworkDetails;
  setError: (error: string) => void;
}

export const ConfirmTransaction = (props: ConfirmTxProps) => {
  const signWithFreighter = async () => {
    const server = getServer(props.networkDetails);

    const txBuilder = await getTxBuilder(
      props.pubKey,
      props.fee,
      server,
      props.networkDetails.networkPassphrase,
    );

    let tx;
    if (props.tokenIssuer && props.tokenSymbol) {
      tx = changeTrustTransaction({
        tokenIssuer: props.tokenIssuer,
        tokenSymbol: props.tokenSymbol,
        limit: props.limit || undefined,
        txBuilder,
      });
    } else if (props.contractAddress && props.memberAddress) {
      tx = await signupTransaction({
        contractAddress: props.contractAddress,
        memberPubKey: props.pubKey,
        txBuilder,
        server,
        networkPassphrase: props.networkDetails.networkPassphrase,
      });
    } else {
      throw new Error("could not build that transaction");
    }

    try {
      const signedTx = await signTx(tx, props.pubKey, props.kit);
      props.onTxSign(signedTx);
    } catch (error) {
      console.log("error in confirm-transaction.tsx signWithFreighter", error);
      props.setError(ERRORS.UnableToSignTx);
    }
  };
  return (
    <>
      <Heading as="h1" size="sm">
        Confirm Transaction
      </Heading>
      <div className="tx-details">
        <div className="tx-detail-item">
          <p className="detail-header">Network</p>
          <p className="detail-value">{props.networkDetails.network}</p>
        </div>
        <div className="tx-detail-item">
          <p className="detail-header">Source</p>
          <div className="source-identicon">
            <Profile isShort publicAddress={props.pubKey} size="sm" />
          </div>
        </div>
        { props.tokenIssuer && props.tokenSymbol && (
          <>
            <div className="tx-detail-item">
              <p className="detail-header">Asset Code</p>
              <p className="detail-value">{props.tokenSymbol}</p>
            </div>
            <div className="tx-detail-item">
              <p className="detail-header">Asset Issuer</p>
              <div className="issuer-identicon">
                <Profile isShort publicAddress={props.tokenIssuer} size="sm" />
              </div>
            </div>
            <div className="tx-detail-item">
              <p className="detail-header">Trustline Limit</p>
              <p className="detail-value">
                {props.limit !== "" ? props.limit : "(Default Maximum)"}
              </p>
            </div>
          </>
        )}
        { props.contractAddress && props.memberAddress && (
          <>
            <div className="tx-detail-item">
              <p className="detail-header">Contract Address</p>
              <div className="contract-identicon">
                <Profile isShort publicAddress={props.contractAddress} size="sm" />
              </div>
            </div>
            <div className="tx-detail-item">
              <p className="detail-header">Member Address</p>
              <div className="member-identicon">
                <Profile isShort publicAddress={props.memberAddress} size="sm" />
              </div>
            </div>
          </>
        )}
        <div className="tx-detail-item">
          <p className="detail-header">Fee</p>
          <p className="detail-value">
            {(parseInt(props.fee, 10) / 10000000).toString()} XLM
          </p>
        </div>
      </div>
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={signWithFreighter}
        >
          Sign with Freighter
        </Button>
      </div>
    </>
  );
};
