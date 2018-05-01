<template>
    <div id="app">
        <top-menu></top-menu>

        <div class="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import TopMenu from './components/TopMenu';

    export default {
        components: { TopMenu },
        
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
    .table {
        margin-top: 20px;
    }
</style>
