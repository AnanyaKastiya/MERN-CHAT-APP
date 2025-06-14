import { Avatar, Box, Text, Button } from "@chakra-ui/react";
import React from "react";

const UserListItem = ({ user, handleFunction, removeMode }) => {
  return (
    <Box
      onClick={removeMode ? undefined : handleFunction}
      cursor={removeMode ? "default" : "pointer"}
      bg={removeMode ? "gray.100" : "#E8E8E8"}
      _hover={{ background: removeMode ? "gray.200" : "#38B2AC", color: removeMode ? "black" : "white" }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      borderRadius="lg"
      mb={2}
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center">
        <Avatar
          mr={2}
          size="sm"
          cursor="pointer"
          name={user.name}
          src={user.pic}
        />
        <Box>
          <Text>{user.name}</Text>
          <Text fontSize="xs">
            <b>Email : </b>
            {user.email}
          </Text>
        </Box>
      </Box>
      {removeMode && (
        <Button size="xs" colorScheme="red" onClick={handleFunction} ml={2}>
          Remove
        </Button>
      )}
    </Box>
  );
};

export default UserListItem;
