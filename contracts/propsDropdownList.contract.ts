import { Block } from "@imagina/qform/contracts/block.contract";

export interface PropsDropdownList {
    index: number;
    block: Block;
    childFields: Array<Block>;
}