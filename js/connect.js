// js/connect.js - Apenas conexão com carteira na rede Base
const BASE_CHAIN_ID = "0x2105"; // 8453 em hexadecimal

const connectButton = document.getElementById("connectButton");
const accountInfo = document.getElementById("accountInfo");
const accountAddress = document.getElementById("accountAddress");
const networkName = document.getElementById("networkName");

let userAccount = null;

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Solicita acesso à carteira
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAccount = accounts[0];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Verifica se está na Base
      if (network.chainId.toString() !== "8453") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID }],
          });
        } catch (switchError) {
          // Se a rede não estiver adicionada, tenta adicionar
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: BASE_CHAIN_ID,
                chainName: "Base",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"]
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Tudo certo! Redireciona para a página de missões
      localStorage.setItem("connectedAddress", userAccount);
      window.location.href = "daily-missions.html";
    } catch (error) {
      alert("Erro ao conectar: " + error.message);
      console.error(error);
    }
  } else {
    alert("Por favor, instale MetaMask, Coinbase Wallet ou outra carteira compatível!");
    window.open("https://base.org/ecosystem/wallets", "_blank");
  }
});

// Atualiza se o usuário trocar de conta ou rede
window.ethereum?.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    location.reload();
  } else {
    userAccount = accounts[0];
    localStorage.setItem("connectedAddress", userAccount);
    window.location.href = "daily-missions.html";
  }
});

window.ethereum?.on("chainChanged", () => {
  location.reload();
});