import { computed, onMounted, ref, toRefs, watch, ComponentPublicInstance } from 'vue'
import { PropsDropdownList } from '@imagina/qform/contracts'

export default function useDropdownList({ props }) {
    const isUnfolded = ref(true)
    const { 
        index, 
        block, 
        childFields, 
        copiedFieldId 
    } = toRefs<PropsDropdownList>(props);
    const dragOptions = ref({
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
    })
    const onUnfolded = () => {
        isUnfolded.value = !isUnfolded.value
    }
    const idChildFields = ref<Array<number>>([])

    const extractId = () => {
        childFields.value.map(block => {
            if (block) {
                block.fields.map(
                    field => {
                        if (field?.parentId)
                            idChildFields.value.push(field?.parentId)
                    }
                )
            }
        })
    }

    onMounted(() => {
        extractId()
    })

    watch(childFields, () => {
        idChildFields.value = []
        extractId()
    })

    watch(copiedFieldId, () => {
        if (copiedFieldId.value) idChildFields.value.push(copiedFieldId.value)
    })

    const nameBlock = computed(() => {
        return block.value?.title || block.value?.name || `Bloque #${index.value}`
    })

    const checkAssets = (idField: number | null) => {
        const idParentFields: Array<number> = []

        block.value.fields.map(field => {
            if (field?.id)
                idParentFields.push(field.id)
        })

        return idChildFields.value.some(parentId => {
            if (idField === parentId) {
                return idParentFields.includes(parentId)
            }
        })
    }

    return {
        isUnfolded,
        dragOptions,
        block,
        nameBlock,
        onUnfolded,
        checkAssets
    }
}