import { Block } from "modules/qform/contracts/block.contract";

export interface Form {
    id?: number;
    title?: string;
    systemName: string;
    blocks: Block[];
    active: number;
    createdAt: string;
    embed: string;
    order: any;
    parentId: null | number;
    formType: number;
    options: object;
    updatedAt: string;
    url: string;
    fields: Array<[]>;
}
