import React from "react";
import {
  Button,
  Card,
  Heading,
  IconButton,
  Icon,
  Loader,
  Profile,
} from "@stellar/design-system";
import { copyContent } from "../../helpers/dom";

interface SubmitTxProps {
  tokenIssuer?: string;
  tokenSymbol?: string;
  limit?: string;
  contractAddress?: string;
  memberAddress?: string;
  fee: string;
  pubKey: string;
  network: string;
  onClick: () => void;
  signedXdr: string;
  isSubmitting: boolean;
}

export const SubmitTransaction = (props: SubmitTxProps) => (
  <>
    <Heading as="h1" size="sm">
      Submit Transaction
    </Heading>
    <div className="tx-details">
      <div className="tx-detail-item">
        <p className="detail-header">Network</p>
        <p className="detail-value">{props.network}</p>
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
    <div className="signed-xdr">
      <p className="detail-header">Signed XDR</p>
      <Card variant="secondary">
        <div className="xdr-copy">
          <IconButton
            altText="copy signed xdr data"
            icon={<Icon.ContentCopy key="copy-icon" />}
            onClick={() => copyContent(props.signedXdr)}
          />
        </div>
        <div className="xdr-data">{props.signedXdr}</div>
      </Card>
    </div>
    <div className="submit-row-confirm">
      <Button size="md" variant="tertiary" isFullWidth onClick={props.onClick}>
        Submit Transaction
        {props.isSubmitting && <Loader />}
      </Button>
    </div>
  </>
);
