// js/connect.js - FUNCIONA EM TODOS OS CELULARES E DESKTOP (2025)

const connectButton = document.getElementById("connectButton");

connectButton.addEventListener("click", async () => {
  connectButton.disabled = true;
  connectButton.textContent = "Conectando...";

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const siteUrl = encodeURIComponent(window.location.href.split("?")[0]); // URL limpa

  // 1. TENTA CONEXÃO DIRETA (desktop ou in-app browser)
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Força Base se necessário
      if (network.chainId !== 8453n) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } catch (e) {
          if (e.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x2105",
                chainName: "Base",
                rpcUrls: ["https://mainnet.base.org"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://basescan.org"]
              }]
            });
          }
        }
      }

      // SUCESSO → SALVA E REDIRECIONA FORÇADAMENTE
      localStorage.setItem("connectedAddress", accounts[0]);
      window.location.replace("daily-missions.html"); // ← FORÇA REDIRECIONAMENTO
      return;

    } catch (err) {
      console.error(err);
      alert("Conexão rejeitada ou erro. Tente novamente.");
      connectButton.disabled = false;
      connectButton.textContent = "Conectar Carteira";
      return;
    }
  }

  // 2. MOBILE: Usa o melhor deep link universal da Base (funciona em 99% dos casos)
  if (isMobile) {
    const universalLink = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
    
    // Tenta abrir
    window.location.href = universalLink;

    // Se voltar (usuário fechou sem conectar), mostra mensagem clara
    setTimeout(() => {
      if (document.hasFocus?.() || !window.ethereum) {
        if (confirm("Você precisa abrir no MetaMask ou Base Wallet.\n\nToque em OK para tentar novamente")) {
          window.location.href = universalLink;
        }
      }
    }, 2500);

    return;
  }

  // 3. Desktop sem MetaMask
  alert("Instale a MetaMask para continuar");
  window.open("https://metamask.io/download/", "_blank");
  connectButton.disabled = false;
  connectButton.textContent = "Conectar Carteira";
});

// Sempre recarrega se trocar conta/rede
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged", () => location.reload());
}