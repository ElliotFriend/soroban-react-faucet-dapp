import React from "react";
import { Button, Heading, Paragraph } from "@stellar/design-system";

interface BecomeMemberProps {
  onClick: () => void;
}

export const BecomeMember = (props: BecomeMemberProps) => (
  <>
    <Heading as="h1" size="sm" addlClassName="title">
      Become a FIB Member
    </Heading>
    <Paragraph size="sm">
      You're now ready to become an official FIB member! Woo-hoo!
    </Paragraph>
    <Paragraph size="sm">
      Clicking next will simulate the Soroban transaction, and estimate the
      required fee.
    </Paragraph>
    <Button size="md" variant="tertiary" isFullWidth onClick={props.onClick}>
      Next
    </Button>
  </>
);
