"use client"
import React, { useState } from 'react';
import { collection, getDocs, getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import app from '@/app/firebase';
import "tailwindcss/tailwind.css";

interface SearchResult {
  id: string;
  name: string;
}

interface Car {
  Name: string;
  Capacity: string;
}

interface AutocompleteProps {
  onSelect: (selectedName: string) => void; // Callback function prop
}

const Autocomplete: React.FC<AutocompleteProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null); // State to hold the selected item
  const [capacity, setCapacity] = useState<string | null>(null); // State to hold the capacity of the selected item
  const [formData, setFormData] = useState<Car>({
    Name: "",
    Capacity: ""
  });

  const handleSearch = async (queryStr: string) => {
    console.log("Connected to Collections");
    setSearchTerm(queryStr);
    if (!queryStr.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const db = getFirestore(app);
      const carCollectionRef = collection(db, 'Cars');
      const querySnapshot = await getDocs(carCollectionRef);

      const results: SearchResult[] = [];
      querySnapshot.forEach((doc) => {
        const id = doc.id;
        results.push({
          id,
          name: id, // Since the document ID is the car name
        });
      });

      // Filter results based on search term
      const filteredResults = results.filter(result =>
        result.name.toLowerCase().includes(queryStr.toLowerCase())
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSelect = async (selectedItem: SearchResult) => {
    setSelectedItem(selectedItem); // Update selected item
    setSearchTerm(selectedItem.name); // Fill input field with selected value
    onSelect(selectedItem.name); // Call the callback function with the selected name

    try {
      const db = getFirestore(app);
      const carDocRef = doc(db, 'Cars', selectedItem.id);
      const carDocSnapshot = await getDoc(carDocRef);
      const carData = carDocSnapshot.data() as Car | undefined;

      if (carData) {
        setCapacity(carData.Capacity); // Update capacity state with the capacity of the selected car

        // Extract numeric part before "Km" and log it
        const capacityNumericPart = carData.Capacity.match(/\d+(?=\s*Km)/)?.[0];
        console.log('Data to be sent to the model:', capacityNumericPart);
      }
    } catch (error) {
      console.error('Error fetching car capacity:', error);
    }
  };

  return (
    <div className='border flex flex-col gap-lg-5 border-2 lg:w-1/2 align-self-lg-center ml-32'>
      <input
        type="text"
        value={searchTerm}
        className='w-full'
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Car name"
      />
      <ul>
        {searchResults.map((result) => (
          <li key={result.id} onClick={() => handleSelect(result)}>
            {result.name}
          </li>
        ))}
      </ul>
      {selectedItem && capacity && (
        <div>
          Capacity of {selectedItem.name} is {capacity}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
