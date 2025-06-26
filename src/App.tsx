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
  const [url, setUrl] = useState<string | null>(null);
  const [counter, setCounter] = useState<number>(0);
  const [counterSetting, setCounterSetting] = useState<number>(5);
  const [footerColor, setFooterColor] = useState<string>("#1b9dd8");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Clean up the interval when the component unmounts
    const interval = setInterval(() => {
      if (counter <= 0 && url) {
        setUrl(null);
      } else if (counter > 0) {
        setCounter((prevCounter) => prevCounter - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [counter, setCounter]);

  return (
    <>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 30, position: 'relative' }}>
        <img src={process.env.PUBLIC_URL + "/svlogo.png"} alt="Logo" style={{ display: "block" }} />
        <IconButton
          aria-label="Settings"
          icon={<SettingsIcon />} 
          size="md"
          variant="ghost"
          style={{ position: 'absolute', right: 0, top: 0 }}
          onClick={onOpen}
        />
      </div>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Setting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Counter Value: {counterSetting} seconds</Text>
            <Slider min={0} max={60} value={counterSetting} onChange={setCounterSetting} mb={4}>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text mb={2}>Footer Color:</Text>
            <Input type="color" value={footerColor} onChange={e => setFooterColor(e.target.value)} width="60px" p={0} border="none" bg="transparent" />
          </ModalBody>
        </ModalContent>
      </Modal>
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
            <QrReader
              onResult={(result, error) => {
                if (result) {
                  const text = result.getText().trim();
                  if (isValidUrl(text)) {
                    setCounter(counterSetting);
                    setUrl(text);
                  }
                }
                if (error) {
                  console.error(error);
                }
              }}
              constraints={{ facingMode: "environment", aspectRatio: 1 }}
            />
          </Box>
        </VStack>
      </div>
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
            {url && <iframe title={"bashmix"} src={url} width={"100%"} height={"600px"}></iframe>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default App;
