import Vue, { 
  ref, 
  computed, 
  watch, 
  provide, 
  onMounted, 
  nextTick,
  getCurrentInstance
} from 'vue'
import { 
  getForm, 
  createBlock, 
  createField as createCopyField,
  updateBlock,
  updateField,
} from '@imagina/qform/actions/manageForm'

import { 
  Element, 
  Form, 
  Field, 
  CrudFields, 
  CrudForm,
  CrudBlocks,
} from '@imagina/qform/contracts/'

import { dataForm } from '@imagina/qform/models'

import VueRouter from 'vue-router'

export default function useCrudLeads(attrs) {

  const loading = ref(false)
  const proxy = (getCurrentInstance() as any).proxy as any
  const updatedBlockId = ref(null)
  const loadingSkeleton = ref(false)
  const crudFields = ref<null | CrudFields>(null)
  const formData = ref<Form>(dataForm);
  const crudBlocks = ref<null | CrudBlocks>(null)
  const crudForm = ref<null | CrudForm>(null)
  const softLoading = ref(false)
  const editAction = ref([{
    action:() => {
      crudForm.value?.update(formData.value)
    },
    label: Vue.prototype.$tr('iforms.cms.label.editForm'),
    props: {
      icon: 'fa fa-pencil', 
      id: 'crudIndexViewAction'
    },
    vIf: true,
    vIfAction: false,
  },{
    props: {
      icon: 'fa-light fa-trash-can',
      id: 'crudIndexViewAction'
    },
    action:async () => {
      await crudForm.value?.delete(formData.value)
    },
    label: Vue.prototype.$tr('isite.cms.label.delete'),
    vIf: true,
  }])
  const tooltipInfo = ref({
    title: Vue.prototype.$tr('iforms.cms.label.childForms'),
    description: Vue.prototype.$tr('iforms.cms.message.tooltipInfoFormParent'),
    icon: 'fa-regular fa-list-tree',
    class: 'q-ml-sm' 
  })
  const dragOptions = ref({
    animation: 200,
    disabled: false,
    ghostClass: "ghost"
  })
  const isSon = ref(false);
  const parentForm = ref({});
  const blockCreateField = ref(false);
  const fields = ref([]);
  const timerId = ref<any>(0)
  const timerIdBlock = ref<any>(0)

  onMounted(async () => {
    await nextTick()
    init()
  })

  watch(fields, () => {
    fields.value.forEach((element: Element, index: number) => {
      element.order = index
    })
  })

  const refs = computed(() => {
    return {
      crudBlocks: crudBlocks.value,
      crudFields: crudFields.value,
    }
  })

  provide('refs', refs)

  const customCrudForm = computed(() => {
    return {
      update: {
        title: Vue.prototype.$tr('iforms.cms.updateForm'),
        to: null
      }
    }
  })

  const customCrudBlocks = computed(() => {
    return {
      getDataForm: (data, typeForm) => {
        return new Promise(resolve => {
          //Transform data of created
          const blocks = formData.value.blocks
          if (typeForm == 'create') {
            //asigned sortOrder
            data.sortOrder = blocks 
              ? (blocks.length + 1) 
              : 1
          }
          resolve(data)
        })
      },
    }
  })

  const customCrudFields = computed(() => {
    const POSITION = 1
    return {
      ...customPropsOnUpdate.value,
      getDataForm: (data, typeForm) => {
        return new Promise(resolve => {
          // Transform data of created
          if (typeForm === 'create') {
            // Set block ID
            data.blockId = blockCreateField.value
            // Assigned order
            data.Order = formData.value.order
              ? (formData.value.order.length + 1) 
              : POSITION
            // Set field name value
            data.name = Vue.prototype.$helper.getSlug(
              data[proxy.$store.state.qsiteApp.defaultLocale].label
            )
          }

          // Response
          resolve(data)
        })
      },
    }
  })

  const customPropsOnUpdate = computed(() => {
    return isSon.value ? {
      update: {
        description: Vue.prototype.$tr('iforms.cms.message.fieldEditingModalbanner'),
        customFormProps: {
          type: {
            props: {
              readonly: true
            },
          },
          entity: {
            props: {
              readonly: true
            }
          },
          max: {
            props: {
              readonly: true
            }
          },
          min: {
            props: {
              readonly: true
            }
          },
          maxlength: {
            props: {
              readonly: true
            }
          },
          mimes: {
            props: {
              readonly: true
            }
          },
          required: {
            props: {
              readonly: true,
              disabled: true
            }
          }
        }
      },
    } : {}
  })

  const showDescription = computed(() => {
    return isSon.value
      ? Vue.prototype.$tr('iforms.cms.message.descriptionChildrenForm')
      : Vue.prototype.$tr('iforms.cms.message.descriptionParentForm')
  })

  const formId = computed(() => {
    return attrs.paramId || attrs.id
  })

  const showTooltip = computed(() => {
    return isSon.value ? tooltipInfo.value : null
  })

  const isAutoWidth = computed(() => {
    return formData.value?.blocks?.length === 1
  })

  const init = async () => {
    await getData()
  }

  const getData = async (activateLoadingSkeleton=true) => {
    loadingSkeleton.value = activateLoadingSkeleton
    softLoading.value = !activateLoadingSkeleton
    try {
      const dataForm = await getForm(formId.value, true)
      formData.value = dataForm.data
      if (dataForm.data.parentId) {
        const dataParentForm = await getForm(dataForm.data.parentId, true)
        parentForm.value = dataParentForm.data
        isSon.value = true
      }
      loadingSkeleton.value = false
      softLoading.value = false
    } catch (err) {
      Vue.prototype.$apiResponse.handleError(err, () => {
        loadingSkeleton.value = false
        softLoading.value = false
      })
    }
  }

  const errorMessage = () => {
    Vue.prototype.$alert.error({
      message: Vue.prototype.$tr('isite.cms.message.errorRequest'),
      pos: 'bottom'
    })
  }

  const successMessage = () => {
    Vue.prototype.$alert.success({
      message: Vue.prototype.$tr('isite.cms.message.recordUpdated')
    })
  }

  const updateIdOfSelectedField = id => {
    updatedBlockId.value = id
  }

  const getDataFields = () => {
    const response: Array<object> = []
    const formDataClone = Vue.prototype.$clone(formData.value)

    formDataClone?.blocks.forEach(block => {
      if (block) {
        block?.fields?.forEach((field: Field) => {
          if (field) {
            // assigned field `blockID`
            const blockId: number = block?.id
            // assigned field `order`
            const order: number = response.length + 1
            response.push({
              id: field.id,
              block_id: blockId,
              order
            })
          }
        })
      }
    })

    return response
  }

  const handleUpdatingFields = async () => {
    softLoading.value = true
    const data = {
      attributes: getDataFields()
    }

    if (timerId.value) {
      clearTimeout(timerId.value)
    }

    timerId.value = setTimeout(async function () {
      try {
        await updateField({ data })
        successMessage()
        softLoading.value = false
      } catch (err) {
        errorMessage()
      }
      timerId.value = null
    }, 1500)

  }

  const handleChangeInFields = async (props, idBlock) => {
    const field: Field = props?.added?.element
    updatedBlockId.value = idBlock
    if (
      isSon.value &&
      !field?.parentId &&
      formData.value?.id !== field?.formId &&
      field?.formId
    ) {
      await cloneField({ idBlock, field })
      return null
    }

    handleUpdatingFields()
  }

  const getDataBlock = () => {
    const response: Array<object> = []
    const formDataClone = Vue.prototype.$clone(formData.value)
    formDataClone?.blocks?.forEach(block => {
      if (block) {
        const sortOrder = response.length + 1
        response.push({
          id: block?.id,
          sort_order: sortOrder
        })
      }
    })

    return response
  }

  const updateOrderBlock = () => {
    const data = { attributes: getDataBlock() }

    if (timerIdBlock.value) {
      clearTimeout(timerIdBlock.value)
    }

    timerIdBlock.value = setTimeout(async () => {
      try {
        await updateBlock({ data })
        successMessage()
      } catch (err) {
        errorMessage()
      }
      timerIdBlock.value = null
    }, 1500)
  }

  const createField = (blockId) => {
    blockCreateField.value = blockId
    crudFields.value?.create()
  }

  const cloneField = async ({ idBlock, field }) => {
    softLoading.value = true
    const data = {
      ...field
    }
    data.formId = formData.value.id
    data.parentId = field?.id
    delete data.id
    data.blockId = idBlock

    try {
      await createCopyField(data)
      await getData(false)
      softLoading.value = false
    } catch (err) {
      errorMessage()
    }
  }

  const handleCreateBlock = async () => {
    try {
      loading.value = true
      await createBlock(
        attrs.id,
        formData.value.blocks.length + 1
      )
      await getData(false)
      loading.value = false
    } catch (err) {
      errorMessage()
    }
  }

  const redirect = async () => {
    const router = new VueRouter()
    router.back()
  }


  return {
    updatedBlockId,
    editAction,
    tooltipInfo,
    loading,
    softLoading,
    loadingSkeleton,
    dragOptions,
    isSon,
    parentForm,
    formData,
    blockCreateField,
    fields,
    crudFields,
    crudBlocks,
    crudForm,
    customCrudBlocks,
    customCrudForm,
    showDescription,
    customCrudFields,
    showTooltip,
    isAutoWidth,
    getData,
    updateIdOfSelectedField,
    handleChangeInFields,
    updateOrderBlock,
    createField,
    handleUpdatingFields,
    handleCreateBlock,
    cloneField,
    redirect,
  }
}