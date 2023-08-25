import React from "react";
import { Button, Heading, Select } from "@stellar/design-system";

interface ConnectWalletProps {
  selectedNetwork: string;
  pubKey: string | null;
  onClick: () => void;
}

export const ConnectWallet = (props: ConnectWalletProps) => {
  const text = props.pubKey ? "Next" : "Connect Freighter";
  return (
    <>
      <Heading as="h1" size="sm">
        Fib Faucet
      </Heading>
      <Select
        disabled
        fieldSize="md"
        id="selected-network"
        label="Select your Network"
        value={props.selectedNetwork}
      >
        <option>FUTURENET</option>
      </Select>
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
        >
          {text}
        </Button>
      </div>
    </>
  );
};
