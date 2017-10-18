<template>
    <v-app id="lbkcamerawatch" dark>
        <v-toolbar app fixed flat dense clipped-left>
            <v-toolbar-title>Lubbock Traffic Cameras</v-toolbar-title>
        </v-toolbar>
        <main>
            <v-content>
                <v-container fluid style="padding:5px">
                    <router-view></router-view>
                </v-container>
            </v-content>
        </main>
    </v-app>
</template>

<style lang="scss">
    .test {
        color: red;
    }
</style>