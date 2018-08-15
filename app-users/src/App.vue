<template>
    <div>
        <top-menu></top-menu>

        <h2 v-show="!bcConnected && !bcConnectionError">
            Connecting...
        </h2>

        <div class="main-content" v-show="bcConnected && !bcConnectionError">
            <router-view></router-view>
        </div>

        <div v-show="bcConnectionError" class="top-20">
            <h2>Error connecting to the blockchain!</h2>
            <h3 v-show="bcSmartContractAddressError">
                It seems like the address of the smart contract is wrong!
            </h3>
            <p>
                Please check:
            </p>
            <ul>
                <li>The blockchain is running.</li>
                <li>The port in your settings (file: <b>libs/mixinViews.js</b>) match with the blockchain configuration.</li>
                <li>The smart contract compiled JSON (file: <b>assets/UsersContract.json</b>) is updated.</li>
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
    }
</script>

<style>
    .main-content {
        padding:20px 40px;
    }
    h1.title {
        margin-bottom: 50px;
        padding-bottom: 10px;
        border-bottom: 1px solid #CCC;
    }
    .top-20 {
        margin-top: 20px;
    }
</style>
