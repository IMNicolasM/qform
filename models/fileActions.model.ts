import Vue, { computed, inject } from 'vue'


export const fileActions = (emit, isField, typeCrud) => {
    const refsCrud: any = inject('refs')
    return computed(() => {
        return [
            {
                label: Vue.prototype.$tr('isite.cms.label.edit'),
                icon: 'fas fa-pen',
                color: 'green',
                action: element => {
                    if (refsCrud.value)
                        refsCrud.value[typeCrud.value].update(element)
                }
            },
            {
                label: Vue.prototype.$tr('isite.cms.label.delete'),
                icon: 'fas fa-trash',
                color: 'red',
                action: element => {
                    const id = isField ? 'blockId' : 'id'
                    emit('updateIdOfSelectedField', element[id])
                    if (refsCrud.value)
                        refsCrud.value[typeCrud.value].delete(element)
                }
            }
        ]
    })
}
