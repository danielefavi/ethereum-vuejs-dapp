<template>
    <div>
        <top-menu></top-menu>

        <h2 class="p-4" v-show="!bcConnected && !bcConnectionError">
            Connecting...
        </h2>

        <div class="p-4" v-show="bcConnected && !bcConnectionError">
            <router-view></router-view>
        </div>

        <div v-show="bcConnectionError" class="m-4 alert alert-danger">
            <h2 class="pb-4">Error connecting to the blockchain!</h2>

            <p v-if="errorConnectionMessage">
                <b>{{ errorConnectionMessage }}</b>
            </p>

            <p v-show="bcSmartContractAddressError">
                <b>It seems like the address of the smart contract is wrong!</b>
            </p>

            <hr>

            <p>Other common causes of error:</p>
            <ul>
                <li>The blockchain is running.</li>
                <li>The port in your settings (file: <b>libs/mixinViews.js</b>) match with the blockchain configuration.</li>
                <li>The compiled smart contract <b>app-users/src/assets/Users.json</b> is equal to <b>build/Users.json</b>.</li>
            </ul>
        </div>
    </div>
</template>

<script>
// importing common function
import mixin from './libs/mixinViews';
import TopMenu from './components/TopMenu';

export default {
    components: { TopMenu },
    mixins: [mixin],

    name: 'App'
};
</script>

<style>
    h1.title {
        margin-bottom: 50px;
        padding-bottom: 10px;
        border-bottom: 1px solid #CCC;
    }
</style>
