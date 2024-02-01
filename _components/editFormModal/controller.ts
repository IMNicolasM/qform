import { reactive, toRefs } from "vue";

export default function controller(props: any, emit: any) {

  // States
  const state = reactive({
    formId: null,
    showModal: false
  })

  // Methods
  const methods = {
    editForm: (formId) => {
      state.formId = formId
      state.showModal = true
    },
    handleCloseModal: () => {
      emit('hide')
    }
  }

  return { ...(toRefs(state)), ...methods }
}
