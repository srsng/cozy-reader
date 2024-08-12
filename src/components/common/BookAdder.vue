<template>
    <input
        type="file"
        @change="handleFileChange"
        id="bookInput"
        multiple
        style="display: none"
    />
</template>

<script>

export default {
    name: "BookAdder",
    methods: {
        handleFileChange(event) {
            this.$emit("upload-books", event);
        },
    },
};

</script>