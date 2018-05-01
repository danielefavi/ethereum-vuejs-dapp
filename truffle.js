module.exports = {
    networks: {
        ganache: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
        privatebc: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "4224"
        },
    }
};
