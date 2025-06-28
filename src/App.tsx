// App.tsx
// Main application component for SafeQR2025
// Features:
// - QR code scanner with adjustable popup timer
// - Settings modal for counter and footer color
// - Camera disables when settings modal is open

import { SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useDisclosure,
  Input
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";

import "./App.css";
import { isValidUrl } from "@src/isValidUrl";

function App() {
  // Default values
  const DEFAULT_COUNTER = 5;
  const DEFAULT_FOOTER_COLOR = "#1b9dd8";
  const DEFAULT_LOGO = process.env.PUBLIC_URL + "/svlogo.png";

  // State for the scanned URL (null if not scanning)
  const [url, setUrl] = useState<string | null>(null);
  // State for the QR popup countdown
  const [counter, setCounter] = useState<number>(0);
  // State for the counter value set in settings
  const [pendingCounter, setPendingCounter] = useState<number>(() => {
    const saved = localStorage.getItem('pendingCounter');
    return saved !== null ? Number(saved) : DEFAULT_COUNTER;
  });
  // State for the footer color
  const [footerColor, setFooterColor] = useState<string>(() => {
    return localStorage.getItem('footerColor') || DEFAULT_FOOTER_COLOR;
  });
  // State for the logo image (data URL or default)
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('logoImage') || DEFAULT_LOGO;
  });
  // Chakra UI modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pendingCounter', String(pendingCounter));
  }, [pendingCounter]);
  useEffect(() => {
    localStorage.setItem('footerColor', footerColor);
  }, [footerColor]);
  useEffect(() => {
    if (logo === DEFAULT_LOGO) {
      localStorage.removeItem('logoImage');
    } else {
      localStorage.setItem('logoImage', logo);
    }
  }, [logo, DEFAULT_LOGO]);

  // Countdown effect for the QR popup
  useEffect(() => {
    const interval = setInterval(() => {
      if (counter <= 0 && url) {
        setUrl(null); // Close QR popup when timer ends
      } else if (counter > 0) {
        setCounter((prevCounter) => prevCounter - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [counter, setCounter, url]);

  // Handler for closing the settings modal
  const handleSettingsClose = () => {
    onClose();
  };

  // Handler to reset settings to default values
  const handleResetDefaults = () => {
    setPendingCounter(DEFAULT_COUNTER);
    setFooterColor(DEFAULT_FOOTER_COLOR);
    setLogo(DEFAULT_LOGO);
  };

  // Handler for logo file input
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setLogo(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Header with logo and settings icon */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 30, position: 'relative' }}>
        <img src={logo} alt="Logo" style={{ display: "block", maxHeight: 80 }} />
        <IconButton
          aria-label="Settings"
          icon={<SettingsIcon color="gray.300" />} 
          size="md"
          variant="ghost"
          style={{ position: 'absolute', right: 0, top: 0 }}
          onClick={onOpen}
        />
      </div>
      {/* Settings Modal */}
      <Modal isOpen={isOpen} onClose={handleSettingsClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Setting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Counter slider */}
            <Text mb={2}>Counter Value: {pendingCounter} seconds</Text>
            <Slider
              min={0}
              max={60}
              value={pendingCounter}
              onChange={val => {
                // Debug log for slider
                console.log('Slider value changed:', val);
                setPendingCounter(val);
              }}
              mb={4}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            {/* Footer color picker */}
            <Text mb={2}>Footer Color:</Text>
            <Input
              type="color"
              value={footerColor}
              onChange={e => setFooterColor(e.target.value)}
              width="60px"
              p={0}
              border="none"
              bg="transparent"
            />
            {/* Logo uploader */}
            <Text mt={4} mb={1}>Logo Image:</Text>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              mb={2}
            />
            <Box mb={2}>
              <img src={logo} alt="Current Logo" style={{ maxWidth: 120, maxHeight: 60, display: 'block', margin: '0 auto' }} />
            </Box>
            {/* Reset to defaults button */}
            <Box mt={4} textAlign="right">
              <button
                style={{
                  background: '#eee',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Main QR scanner and title */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <VStack spacing={8} align={"center"} justify={"center"} p={8}>
          <Text fontSize={"36px"} fontWeight={"bold"} mb={0}>
            Order Your Car Here!
          </Text>
          <Box
            width={"100%"}
            maxWidth={"500px"}
            border={"4px solid"}
            borderRadius={"lg"}
            borderColor={!!url ? "green.500" : "gray.300"}
          >
            {/* Only show camera when settings modal is closed */}
            {!isOpen && (
              <QrReader
                onResult={(result, error) => {
                  if (result) {
                    const text = result.getText().trim();
                    if (isValidUrl(text)) {
                      // Debug log for counter value
                      console.log('Setting counter to:', pendingCounter);
                      setCounter(pendingCounter);
                      setUrl(text);
                    }
                  }
                  // Removed error logging to avoid console noise
                }}
                constraints={{ facingMode: "environment", aspectRatio: 1 }}
              />
            )}
          </Box>
        </VStack>
      </div>
      {/* Footer with dynamic color */}
      <div
        style={{
          width: "100%",
          height: 260,
          background: footerColor,
          position: "fixed",
          left: 0,
          bottom: 0,
          zIndex: 0,
        }}
      ></div>
      {/* QR popup modal */}
      <Modal isCentered={true} size={"md"} isOpen={!!url} onClose={() => setUrl(null)}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderTopRadius={"lg"}>
          <ModalHeader>
            <HStack justifyContent={"space-between"}>
              <Text>Valet Jo</Text>
              <Text paddingEnd={"20px"}>Close after {counter}s</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Show scanned URL in iframe */}
            {url && <iframe title={"bashmix"} src={url} width={"100%"} height={"600px"}></iframe>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default App;
