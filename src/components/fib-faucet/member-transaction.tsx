import React, { ChangeEvent } from "react";
import { Button, Heading, Input, Paragraph } from "@stellar/design-system";

interface MemberTransactionProps {
    fee: string;
    onClick: () => void;
    setFee: (fee: string) => void;
}

export const MemberTransaction = (props: MemberTransactionProps) => {
    const handleFeeChange = (event: ChangeEvent<HTMLInputElement>) => {
        props.setFee(event.target.value);
    };

    return (
        <>
            <Heading as="h1" size="sm">
                Member Transaction Settings
            </Heading>
            <Paragraph size="sm">
                You can now sign up. The estimated fee is presented below, but
                are welcome to change it if you want. (Note: Changes in the fee
                submitted may change the likelihood of a successful transaction)
            </Paragraph>
            <Input
                fieldSize="md"
                id="input-fee"
                label="Estimated Fee (XLM)"
                value={(parseInt(props.fee, 10) / 10000000).toString()}
                onChange={handleFeeChange}
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
