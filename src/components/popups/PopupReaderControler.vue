<template>
    <div 
        @click.stop
        class="popup flex flex-col overflow-y-auto overflow-x-hidden w-64 h-fit max-h-72 select-none rounded-lg border-solid border-2 header"
    >
        <header class="w-full h-fit flex items-center justify-between">
            <div class="pl-2 text-lg">设置</div>
            <div>
                <span class="pr-2"> 刷新页面:</span>
                <div class="titlebar-button round-btn-style" @click="refreshPage">
                    <IconRefresh class="size-4" title="refresh" />
                </div>
            </div>
        </header>

        <div class="flex items-center mx-2 mt-2 contents-body">
            <span class="">reader width:</span>
            <subPopupSettingChanger :value="readerSettings.viewerWidth" units="%" 
                @value-change="handdleViewerWidthChange"
             class="ml-2"/>
             <div class="footerbar-button ml-2 round-btn-style">
                <IconRefresh class="size-4" @click='this.$store.commit("resetViewerWidth");' />
            </div>
        </div>
        <div class="w-full popup-sub border-solid border-t-2 my-2"></div>
        
        <!-- <div class="flex items-center mx-2 contents-body">
            <span class="">font family:</span>
            <span>todo：一个列表</span>
        </div>
        <div class="w-full popup-sub border-solid border-t-2 my-2"></div>
         -->
        <div class="flex items-center mx-2 contents-body">
            <span class="">font size:</span>
            <subPopupSettingChanger :value="readerSettings.fontSize" units="px" 
                @value-change="handdleFontSizeChange"
             class="ml-2"/>

             <div class="footerbar-button ml-2 round-btn-style">
                <IconRefresh class="size-4" @click='this.$store.commit("resetFontSize");' />
            </div>
        </div>
        <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

        <div class="flex items-center mx-2 contents-body">
            <span class="">line height:</span>
            <subPopupSettingChanger :value="readerSettings.lineHeight" units="%" 
                @value-change="handdleLineHeightChange"
             class="ml-2"/>

             <div class="footerbar-button ml-2 round-btn-style">
                <IconRefresh class="size-4" @click='this.$store.commit("resetLineHeight");' />
            </div>
        </div>
        <div class="w-full popup-sub border-solid border-t-2 my-2"></div>

        <div class="flex items-center mx-2 mb-2 contents-body">
            <span class="">first line indent:</span>
            <subPopupSwitchToggle class="ml-2" :value="readerSettings.firstLineIndent" @touch-swtich="touchIndentSwitch"/>
        </div>

    </div>
</template>

<script>

import subPopupSwitchToggle from './subPopups/subPopupSwitchToggle.vue';
import subPopupSettingChanger from './subPopups/subPopupSettingChanger.vue';
import { mapState } from 'vuex';

import { IconRefresh, } from "@/components/icons";

export default {
    name: "PopupsReaderControler",
    components: {
        IconRefresh,
        subPopupSwitchToggle,
        subPopupSettingChanger,
    },
    computed: {
        ...mapState({
            readerSettings: state => state.readerSettings
        })
    },
    methods: {
        touchIndentSwitch(value) {
            // console.log('touchIndentSwitch', value);
            // console.log('this.readerSettings', this.readerSettings);
            this.$store.commit('setReaderSettings', {
                'firstLineIndent': value
            });
        },
        handdleFontSizeChange({type}) {
            // console.log("handdlefontSizeChange", type)
            if (type === "increase") {
                this.$store.commit("increaseFontSize");
            }
            else {
                this.$store.commit("decreaseFontSize");
            } 
            // console.log('this.readerSettings.fontSize', this.readerSettings.fontSize);
        },
        handdleLineHeightChange({type}) {
            // console.log("handdleLineHeightChange", type)
            if (type === "increase") {
                this.$store.commit("increaseLineHeight");
            }
            else {
                this.$store.commit("decreaseLineHeight");
            } 
            // console.log('this.readerSettings.lineHeight', this.readerSettings.lineHeight);
        },
        handdleViewerWidthChange({type}) {
            // console.log("handdleViewerWidthChange", type);
            if (type === "increase") {
                this.$store.commit("increaseViewerWidth");
            }
            else {
                this.$store.commit("decreaseViewerWidth");
            } 
        },
        refreshPage() {
            this.$router.go(0);
        },
    }
}
</script>