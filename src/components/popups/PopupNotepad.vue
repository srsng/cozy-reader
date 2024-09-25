<template>
  <div class="annotation-container">
    <div class="annotation-header">{{ formattedTimestamp }}</div>
    <div class="annotation-text">{{ truncatedAnnotationText }}</div>
    <textarea v-model="editableNote" class="annotation-note"></textarea>
  </div>
</template>

<script>
export default {
  name: 'PopupNotepad',
  props: {
    timestamp: {
      type: Number,
      required: true
    },
    annotationText: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      editableNote: this.note
    };
  },
  computed: {
    formattedTimestamp() {
      const date = new Date(this.timestamp);
      return date.toLocaleString();
    },
    truncatedAnnotationText() {
      return this.annotationText.length > 100 ? this.annotationText.slice(0, 100) + '...' : this.annotationText;
    }
  }
};
</script>

<style scoped>
.annotation-container {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.annotation-header {
  font-weight: bold;
  margin-bottom: 5px;
}

.annotation-text {
  max-height: 3em; /* 两行文本的高度 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
}

.annotation-note {
  width: 100%;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
}
</style>