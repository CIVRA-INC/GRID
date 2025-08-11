import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import 'dotenv/config';
import { verifyMessage } from 'viem';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const originalMessage =
  'Welcome to GRID! Sign this message to prove you own this wallet.';

app.post('/auth/verify-signature', async (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res
      .status(400)
      .json({ error: 'Address and signature are required.' });
  }

  try {
    const isSignatureValid = await verifyMessage({
      address: address as `0x${string}`,
      message: originalMessage,
      signature: signature as `0x${string}`,
    });

    if (isSignatureValid) {
      const token = jwt.sign({ address }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid signature.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error during verification.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
