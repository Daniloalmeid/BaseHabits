// js/connect.js - Conexão perfeita em celular e desktop (Base + MetaMask + WalletConnect)

const connectButton = document.getElementById("connectButton");
const BASE_CHAIN_ID = "0x2105"; // Base Mainnet

connectButton.addEventListener("click", async () => {
  let provider = null;

  // 1. Verifica se está dentro do app da MetaMask ou Base (in-app browser)
  if (window.ethereum?.isMetaMask || window.ethereum?.isCoinbaseWallet || window.ethereum?.isTrust) {
    provider = window.ethereum;
  }

  // 2. Mobile Deep Link - Força abrir o app instalado (MetaMask ou Base)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && !provider) {
    const deepLink = `https://metamask.app.link/dapp/${encodeURIComponent(window.location.href)}`;
    window.location.href = deepLink;
    // Dá 3 segundos pro usuário abrir, depois tenta WalletConnect como fallback
    setTimeout(() => {
      if (document.hasFocus?.() === false) return;
      alert("Abra com MetaMask ou Base Wallet para continuar");
    }, 3000);
    return;
  }

  // 3. Se chegou aqui, usa o provider injetado (desktop ou celular com app aberto)
  try {
    if (!provider) throw new Error("Nenhuma carteira detectada");

    // Solicita conexão
    await provider.request({ method: "eth_requestAccounts" });

    const ethersProvider = new ethers.BrowserProvider(provider);
    const network = await ethersProvider.getNetwork();

    // Troca pra Base se necessário
    if (network.chainId !== 8453n) {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: BASE_CHAIN_ID,
              chainName: "Base",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"]
            }]
          });
        } else {
          throw switchError;
        }
      }
    }

    // Sucesso! Salva endereço e redireciona
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    localStorage.setItem("connectedAddress", userAddress);
    window.location.href = "daily-missions.html";

  } catch (error) {
    console.error(error);
    if (error.code === 4001) {
      alert("Você rejeitou a conexão");
    } else {
      alert("Erro na conexão. Tente abrir com MetaMask ou Base Wallet");
    }
  }
});

// Detecta troca de conta ou rede
window.ethereum?.on("accountsChanged", (accounts) => {
  if (accounts.length > 0) {
    localStorage.setItem("connectedAddress", accounts[0]);
    if (window.location.pathname.includes("daily-missions")) location.reload();
  } else {
    localStorage.removeItem("connectedAddress");
  }
});

window.ethereum?.on("chainChanged", () => {
  location.reload();
});