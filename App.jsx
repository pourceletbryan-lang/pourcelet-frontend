import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

function App(){
  const [posts, setPosts] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(()=>{ fetchPosts(); }, []);

  const fetchPosts = async ()=>{
    try {
      const res = await axios.get((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/posts');
      setPosts(res.data);
    } catch (e) { console.error(e); }
  }

  const connectWallet = async ()=>{
    if(window.ethereum){
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setWalletAddress(addr);
    } else alert('Install MetaMask');
  }

  const generateAvatar = async ()=>{
    if(!walletAddress) return alert('Connect wallet');
    try {
      const res = await axios.post((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/generate-avatar', { walletAddress, username });
      alert('Avatar minted! TokenURI: ' + (res.data.tokenURI || 'none'));
      fetchPosts();
    } catch (e) {
      console.error(e);
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Pourcelet (Prototype)</h1>
      {!walletAddress ? <button onClick={connectWallet}>Connect Wallet</button> : <div>Connected: {walletAddress}</div>}
      <div style={{marginTop:10}}>
        <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <button onClick={generateAvatar}>Generate Avatar & Get PORC</button>
      </div>

      <h2>Feed</h2>
      {posts.map(p => (
        <div key={p._id} style={{border:'1px solid #ddd', padding:10, marginBottom:10}}>
          <b>{p.username || p.wallet}</b>
          <p>{p.text}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
