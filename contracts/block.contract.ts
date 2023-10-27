import { Field } from "@imagina/qform/contracts/field.contract";

export interface Block {
    id?: number;
    title?: string;
    name?: string;
    description?: string;
    parentId: number;
    fields?: Field[];
    createdAt: string;
    sortOrder?: number;
    sort_order?: number;
    updatedAt: string;
}