import { toRefs, reactive, computed } from 'vue'

export default function useBlock({ props, emit }) {
    const { block, isSon, softLoading, updatedBlockId } = toRefs(props)
        //Style of Scroll area
        const thumbStyle =  reactive({
            right: '-11px',
            borderRadius: '5px',
            backgroundColor: '#555',
            width: '5px',
            opacity: 0.75,
        })
        const contentActiveStyle = reactive({
            color: 'black'
        })

        const activateLoadingAnimation = computed(() => {
            return softLoading.value && block.value.id === updatedBlockId.value
        })

        const createField = (id) => {
            emit('createField', id)
        }

        return {
            block,
            thumbStyle,
            contentActiveStyle,
            isSon,
            softLoading,
            activateLoadingAnimation,
            createField,
        }
}