// js/connect.js - Conexão com MetaMask OU WalletConnect na rede Base
const BASE_CHAIN_ID = "0x2105"; // 8453 em hex
const BASE_NAMESPACE = "eip155"; // Ethereum namespace
const BASE_CHAIN = "eip155:8453";

const connectButton = document.getElementById("connectButton");
const accountInfo = document.getElementById("accountInfo");
const accountAddress = document.getElementById("accountAddress");
const networkName = document.getElementById("networkName");

let userAccount = null;
let provider = null;
let wcProvider = null; // Para WalletConnect

// Inicializa WalletConnect se não for MetaMask
async function initWalletConnect() {
  if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
    return; // Usa MetaMask
  }

  try {
    // Inicializa Universal Provider (para múltiplos chains)
    const universal = await window.WalletConnectUniversalProvider.init({
      projectId: "YOUR_PROJECT_ID_HERE", // Crie grátis em https://cloud.walletconnect.com (ex: "abc123...")
      metadata: {
        name: "BaseHabits",
        description: "Tracker de hábitos na Base com $BHT",
        url: "https://your-site.com", // Substitua pelo seu domínio
        icons: ["https://base.org/favicons/favicon-32x32.png"]
      }
    });

    // Cria Ethereum Provider para Base
    wcProvider = await window.WalletConnectEthereumProvider.init({
      client: universal,
      chains: [BASE_CHAIN], // Força Base
      showQrModal: true, // Mostra QR para mobile
      optionalScopes: ["wallet:balance", "wallet:tokenBalances"]
    });

    // Habilita eventos
    wcProvider.on("display_uri", (uri) => {
      console.log("QR Code URI:", uri); // Opcional: custom modal
    });

    wcProvider.on("accountsChanged", handleAccountsChanged);
    wcProvider.on("chainChanged", handleChainChanged);
    wcProvider.on("disconnect", handleDisconnect);

    await wcProvider.connect(); // Conecta na hora do clique
  } catch (error) {
    console.error("Erro ao init WC:", error);
    alert("Erro ao inicializar WalletConnect: " + error.message);
  }
}

// Detecta e conecta (MetaMask ou WC)
connectButton.addEventListener("click", async () => {
  connectButton.disabled = true;
  connectButton.textContent = "Conectando...";

  try {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
      // MetaMask flow (código anterior mantido)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.BrowserProvider(window.ethereum);
      userAccount = accounts[0];
      await ensureBaseNetwork(provider, window.ethereum);
    } else {
      // WalletConnect flow
      await initWalletConnect();
      if (!wcProvider) throw new Error("Falha na inicialização do WC");

      const accounts = await wcProvider.enable(); // Conecta e pega contas
      provider = new ethers.BrowserProvider(wcProvider); // Adapter para Ethers v6
      userAccount = accounts[0];

      // Verifica e switch para Base (WC já configurado para Base)
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== "8453") {
        await wcProvider.switchChain({ chainId: BASE_CHAIN_ID });
      }
    }

    // Sucesso! Salva endereço e redireciona para missões diárias
    localStorage.setItem("connectedAddress", userAccount);
    window.location.href = "daily-missions.html";
  } catch (error) {
    alert("Erro ao conectar: " + error.message);
    console.error(error);
    connectButton.disabled = false;
    connectButton.textContent = "Conectar Carteira";
  }
});

// Garante rede Base (comum para MM e WC)
async function ensureBaseNetwork(provider, injectedProvider = null) {
  const network = await provider.getNetwork();
  if (network.chainId.toString() !== "8453") {
    try {
      if (injectedProvider) {
        // MetaMask
        await injectedProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID }],
        });
      } else {
        // WC
        await wcProvider.switchChain({ chainId: BASE_CHAIN_ID });
      }
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        // Adiciona rede Base se não existir
        const addParams = {
          chainId: BASE_CHAIN_ID,
          chainName: "Base",
          nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"]
        };

        if (injectedProvider) {
          await injectedProvider.request({
            method: "wallet_addEthereumChain",
            params: [addParams],
          });
        } else {
          // Para WC, usa request
          await wcProvider.request({
            method: "wallet_addEthereumChain",
            params: [addParams],
          });
        }
      } else {
        throw switchError;
      }
    }
  }
}

// Handlers de eventos (comuns para MM e WC)
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    handleDisconnect();
  } else {
    userAccount = accounts[0];
    // Atualiza se mudar conta (mas como redireciona, não precisa de showAccount)
  }
}

function handleChainChanged(chainId) {
  if (parseInt(chainId, 16) !== 8453) {
    alert("Por favor, mude para a rede Base!");
    location.reload();
  }
}

function handleDisconnect() {
  userAccount = null;
  provider = null;
  wcProvider = null;
  connectButton.disabled = false;
  connectButton.textContent = "Conectar Carteira";
  location.reload(); // Recarrega para reset
}

// Listeners para MetaMask (se presente)
if (typeof window.ethereum !== "undefined") {
  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", (chainId) => handleChainChanged("0x" + parseInt(chainId).toString(16)));
}

// Cleanup no unload
window.addEventListener("beforeunload", () => {
  if (wcProvider) wcProvider.disconnect();
});