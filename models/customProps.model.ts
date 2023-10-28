import Vue from 'vue'

export const customProps = () => {
  return {
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
  }
}