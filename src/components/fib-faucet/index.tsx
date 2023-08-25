import React from "react";
import { createPortal } from "react-dom";
import {
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
} from "stellar-wallets-kit";
import {
  Card,
  Caption,
  Layout,
  Loader,
  Notification,
  Profile,
} from "@stellar/design-system";

// @ts-ignore
import * as fibFaucetContract from "fib-faucet-contract";

import { ERRORS } from "../../helpers/error";
import { FUTURENET_DETAILS } from "../../helpers/network";
import {
  getEstimatedFee,
  getServer,
  getTxBuilder,
  submitTransaction,
} from "../../helpers/soroban";

import { ConnectWallet } from "./connect-wallet";
import { AddTrustline } from "./add-trustline";
import { ConfirmTransaction } from "./confirm-transaction";
import { SubmitTransaction } from "./submit-transaction";
import { BecomeMember } from "./become-member";
import { MemberTransaction } from "./member-transaction";

import "./index.scss";
import { TransactionResult } from "./transaction-result";

type StepCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface FibFaucetProps {
  hasHeader?: boolean;
}

export const FibFaucet = (props: FibFaucetProps) => {
  const hasHeader = props.hasHeader === undefined ? true : props.hasHeader;

  const [selectedNetwork] = React.useState(FUTURENET_DETAILS);

  const [stepCount, setStepCount] = React.useState(1 as StepCount);
  const [activePubKey, setActivePubKey] = React.useState(null as string | null);
  const [connectionError, setConnectionError] = React.useState(
    null as string | null,
  );

  const [fee, setFee] = React.useState("100000");
  // const [memo, setMemo] = React.useState("");
  const [limit, setLimit] = React.useState("");
  const [signedXdr, setSignedXdr] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [txResultXDR, setTxResultXDR] = React.useState("");
  // const [hasFibTrustline, setHasFibTrustline] = React.useState(true);

  const [isGettingFee, setIsGettingFee] = React.useState(false);

  const [SWKKit] = React.useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    }),
  );

  // React.useEffect(() => {
  //   Promise.all([
  //     fibFaucetContract.isOpen(),
  //   ]).then(fetched => {
  //     console.log("here is fetched:", fetched);
  //   });
  // }, []);
  // console.log("here is the contract: ", fibFaucetContract);

  // async function getFaucetOpen() {
  //   const result = await fibFaucetContract.isOpen();
  //   console.log('here is your result', result);
  // }
  const getFee = async () => {
    setIsGettingFee(true);
    const server = getServer(selectedNetwork);

    try {
      const builder = await getTxBuilder(
        activePubKey!,
        fee,
        server,
        selectedNetwork.networkPassphrase,
      );

      const estimatedFee = await getEstimatedFee(
        fibFaucetContract.CONTRACT_ID,
        activePubKey!,
        builder,
        server,
      );
      setFee(estimatedFee);
      setIsGettingFee(false);
    } catch (error) {
      console.log("error in getFee():", error);
      setIsGettingFee(false);
    }
  };

  function renderStep(step: StepCount) {
    switch (step) {
      case 9: {
        const onClick = () => setStepCount(1);
        return <TransactionResult onClick={onClick} resultXDR={txResultXDR} />;
      }
      case 8: {
        const submit = async () => {
          const server = getServer(selectedNetwork);

          setIsSubmitting(true);

          try {
            const result = await submitTransaction(
              signedXdr,
              selectedNetwork.networkPassphrase,
              server,
            );
            console.log("submission result", result);
            setTxResultXDR(result);
            setIsSubmitting(false);
            setStepCount((stepCount + 1) as StepCount);
          } catch (error) {
            console.log("error on step 8 submit()", error);
            setIsSubmitting(false);
            setConnectionError(ERRORS.UnableToSubmitTx);
          }
        };
        return (
          <SubmitTransaction
            contractAddress={fibFaucetContract.CONTRACT_ID}
            memberAddress={activePubKey!}
            fee={fee}
            pubKey={activePubKey!}
            network={selectedNetwork.network}
            signedXdr={signedXdr}
            isSubmitting={isSubmitting}
            onClick={submit}
          />
        );
      }
      case 7: {
        const setSignedTx = (xdr: string) => {
          setSignedXdr(xdr);
          setStepCount((stepCount + 1) as StepCount);
        };
        return (
          <ConfirmTransaction
            contractAddress={fibFaucetContract.CONTRACT_ID}
            memberAddress={activePubKey!}
            fee={fee}
            pubKey={activePubKey!}
            kit={SWKKit}
            onTxSign={setSignedTx}
            networkDetails={selectedNetwork}
            setError={setConnectionError}
          />
        );
      }
      case 6: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <MemberTransaction
            fee={fee}
            setFee={setFee}
            onClick={onClick}
          />
        );
      }
      case 5: {
        const becomeMember = async () => {
          await getFee();
          setStepCount((stepCount + 1) as StepCount);
        };

        if (isGettingFee) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        return <BecomeMember onClick={becomeMember} />;
      }
      case 4: {
        const submit = async () => {
          const server = getServer(selectedNetwork);

          setIsSubmitting(true);

          try {
            const result = await submitTransaction(
              signedXdr,
              selectedNetwork.networkPassphrase,
              server,
            );
            setTxResultXDR(result);
            setIsSubmitting(false);

            setStepCount((stepCount + 1) as StepCount);
          } catch (error) {
            console.log("error in step 4 submit()", error);
            setIsSubmitting(false);
            setConnectionError(ERRORS.UnableToSubmitTx);
          }
        };
        return (
          <SubmitTransaction
            tokenIssuer="GBMFAL5I7LQMROEQOPZFAMRFOTJ7TU5DM42LZO36YEC7JYHMKZXZLDMO"
            tokenSymbol="FIB"
            limit={limit}
            fee={fee}
            pubKey={activePubKey!}
            network={selectedNetwork.network}
            signedXdr={signedXdr}
            isSubmitting={isSubmitting}
            onClick={submit}
          />
        );
      }
      case 3: {
        const setSignedTx = (xdr: string) => {
          setSignedXdr(xdr);
          setStepCount((stepCount + 1) as StepCount);
        };
        return (
          <ConfirmTransaction
            tokenIssuer="GBMFAL5I7LQMROEQOPZFAMRFOTJ7TU5DM42LZO36YEC7JYHMKZXZLDMO"
            tokenSymbol="FIB"
            limit={limit || undefined}
            fee={fee}
            pubKey={activePubKey!}
            kit={SWKKit}
            onTxSign={setSignedTx}
            networkDetails={selectedNetwork}
            setError={setConnectionError}
          />
        );
      }
      case 2: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <AddTrustline
            limit={limit}
            tokenSymbol="FIB"
            setLimit={setLimit}
            onClick={onClick}
          />
        );
      }
      case 1:
      default: {
        const onClick = () => {
          setConnectionError(null);

          if (!activePubKey) {
            SWKKit.openModal({
              allowedWallets: [
                WalletType.ALBEDO,
                WalletType.FREIGHTER,
                WalletType.XBULL,
              ],
              onWalletSelected: async (option: ISupportedWallet) => {
                try {
                  SWKKit.setWallet(option.type);
                  const publicKey = await SWKKit.getPublicKey();

                  SWKKit.setNetwork(
                    selectedNetwork.networkPassphrase as WalletNetwork,
                  );
                  setActivePubKey(publicKey);
                } catch (error) {
                  console.log("error in onWalletSelected", error);
                  setConnectionError(ERRORS.WalletConnectionRejected);
                }
              },
            });
          } else {
            setStepCount((stepCount + 1) as StepCount);
          }
        };

        return (
          <ConnectWallet
            selectedNetwork={selectedNetwork.network}
            pubKey={activePubKey}
            onClick={onClick}
          />
        );
      }
    }
  }

  React.useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  return (
    <>
      {hasHeader && (
        <Layout.Header hasThemeSwitch projectId="soroban-react-fib-faucet" />
      )}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <Profile isShort publicAddress={activePubKey} size="sm" />
        )}
      </div>
      <div className="Layout__inset layout">
        <div className="fib-faucet">
          <Card variant="primary">
            <Caption size="sm">stp {stepCount} of 9</Caption>
            {renderStep(stepCount)}
          </Card>
        </div>
        {connectionError !== null &&
          createPortal(
            <div className="notification-container">
              <Notification title={connectionError} variant="error" />
            </div>,
            document.getElementById("root")!,
          )}
      </div>
    </>
  );
};
