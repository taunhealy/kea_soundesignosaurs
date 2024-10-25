import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const imageDirectory = path.join(process.cwd(), 'public/images');
  const imageFilenames = fs.readdirSync(imageDirectory);
  const randomIndex = Math.floor(Math.random() * imageFilenames.length);
  const randomImage = `/images/${imageFilenames[randomIndex]}`;
  
  res.status(200).json({ imageSrc: randomImage });
}

