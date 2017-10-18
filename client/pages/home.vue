<template>
        <v-flex xs12 sm12>
            <v-container fluid grid-list-sm>
                <v-layout row wrap ref="cameraView">
                    <v-flex xs2 v-for="camera in cameraList" :key="camera.id">
                        <v-card flat>
                            <v-card-media :src="`${camera.snapshot}`" v-bind:style="{height:cardHeight}" contain="true" style="background-color:#303030">
                            </v-card-media>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
</template>

<script>
    import AppFacade from '../core/appFacade';
    import io from 'socket.io-client';
    import _ from 'lodash';

    export default {
        components: {},
        data() {
            return {
                cameraList: [],
                cardHeight: '165px'
            };
        },
        mounted() {
            this.sconn = io.connect();
            this.sconn.on('snapshot', (camera) => {
                this.handleIncomingSnapshot(camera);
            });
            this.$subscribeTo(AppFacade.resizeEvent$, this.onResize.bind(this));
            this.$vuetify.load(this.init);
        },
        methods: {
            init() {
                this.onResize();
            },
            handleIncomingSnapshot(camera) {
                let cameraIndex = _.findIndex(this.cameraList, {id: camera.id});
                if (cameraIndex === -1) {
                    this.cameraList.push(camera);
                }
                else {
                    this.cameraList[cameraIndex].snapshot = camera.snapshot;
                }
            },
            onResize() {
                this.$nextTick(() => {
                    let screenWidth = this.$refs.cameraView.clientWidth - 52;
                    let cHeight = (screenWidth / 6) * 0.75;
                    this.cardHeight = `${cHeight}px`;
                });
            }
        }
    }
</script>