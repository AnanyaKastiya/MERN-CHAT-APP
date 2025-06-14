import { Avatar, Box, Text, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      display="flex"
      alignItems="center"
      backgroundColor="purple.500"
      color="white"
      fontSize={12}
    >
      <Avatar
        size="xs"
        name={user.name}
        src={user.pic}
        mr={1}
      />
      <Text mr={1}>{user.name}</Text>
      {handleFunction && (
        <IconButton
          size="xs"
          icon={<CloseIcon />}
          onClick={handleFunction}
          variant="ghost"
          colorScheme="whiteAlpha"
          aria-label="Remove user"
          ml={1}
        />
      )}
    </Box>
  );
};

export default UserBadgeItem;
