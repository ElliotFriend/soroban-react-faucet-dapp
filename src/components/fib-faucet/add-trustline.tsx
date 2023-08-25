import React, { ChangeEvent } from "react";
import { Button, Heading, Input, Paragraph } from "@stellar/design-system";

interface AddTrustlineProps {
  limit: string;
  tokenSymbol: string;
  setLimit: (limit: string) => void;
  onClick: () => void;
}

export const AddTrustline = (props: AddTrustlineProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setLimit(event.target.value);
  };

  return (
    <>
      <Heading as="h1" size="sm" addlClassName="title">
        Set Trustline Limit
      </Heading>
      <Heading as="h2" size="sm" addlClassName="limit">
        {props.limit} {props.tokenSymbol}
      </Heading>
      <Paragraph size="sm">
        The FIB token utilizes the Stellar Asset Contract that is built-in to
        Soroban. We need to create a trustline for this asset on your Stellar
        account first. You can specify a limit for this trustline, if you like.
        This would set a maximum amount of this token your account could hold.
      </Paragraph>
      <Paragraph size="sm">
        Alternatively, leave this blank to use the default limit. Most often,
        leaving this blank is probably the right choice.
      </Paragraph>
      <Input
        fieldSize="md"
        id="input-amount"
        label="Choose trustline limit (optional)"
        value={props.limit}
        onChange={handleChange}
        type="number"
      />
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
        >
          Next
        </Button>
      </div>
    </>
  );
};
