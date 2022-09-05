import { Button, Grid, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, uploadImage } from "slices/dbSlice";
import { AppDispatch } from "slices/store";
import { NotificationManager } from "./Notification";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import { setLoading } from "slices/viewState";
import { getW3link } from "utils/helper";

interface IProfile {}

const Profile = (props: IProfile) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const account = useSelector<any, string | null>(
    (state) => state.web3.selectedAddress
  );
  const [avatar, setAvatar] = useState<File | null>(null);

  const users = useSelector<any, { [key: string]: IUser }>(
    (state) => state.db.Users
  );
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  useEffect(() => {
    setCurrentUser(account ? users[account] : null);
  }, [account, users]);

  useEffect(() => {
    setName(currentUser?.Name || "");
    setBio(currentUser?.Bio || "");
    console.log({user: currentUser});
    setAvatar(null);
  }, [currentUser]);

  const onSave = async () => {
    if (!account) {
      NotificationManager.warning("Please connect to the wallet", "Warn");
      return;
    }

    try {
      dispatch(setLoading(true));

      // save avatar
      let imageUrl: any = null;
      if (avatar) {
        imageUrl = await dispatch(uploadImage(avatar)).unwrap();
        console.log({imageUrl});
      } else if (currentUser?.Image) {
        imageUrl = currentUser?.Image;
      }
      

      const user: IUser = {
        Type: "ADD_USER",
        Name: name,
        Wallet: account,
        Bio: bio,
      };

      if (imageUrl) {
        user.Image = imageUrl;
      }

      dispatch(createUser(user))
        .unwrap()
        .then((user) => {
          // handle result here
          NotificationManager.success("", "Saved");
          navigate("/main");
          console.log({ user: user });
          dispatch(setLoading(false));
        })
        .catch((rejectedValueOrSerializedError) => {
          // handle error here
          console.log({ rejectedValueOrSerializedError });
          dispatch(setLoading(false));
        });
    } catch (ex) {}
  };

  const onFile = (e: any) => {
    setAvatar(e.target.files[0]);
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <label htmlFor="button-asset-images">
        <input
          type="file"
          id="button-asset-images"
          name="image"
          multiple={true}
          onChange={onFile}
          required={true}
          style={{ display: "none" }}
        />
        {avatar ? (
          <Avatar
            name="Avatar"
            size="200px"
            round={true}
            src={avatar ? URL.createObjectURL(avatar) : ""}
          />
        ) : (
          <Avatar name="Avatar" size="200px" round={true} src={currentUser?.Image ? getW3link(currentUser?.Image) : ""} />
        )}
      </label>
      <TextField
        fullWidth
        label="Name"
        variant="standard"
        size="small"
        onChange={(e: any) => setName(e.target.value)}
        value={name}
        className="name"
      />
      <TextField
        fullWidth
        label="Wallet"
        variant="standard"
        size="small"
        value={account}
        className="wallet"
      />
      <TextField
        fullWidth
        id="body"
        label="Bio"
        variant="standard"
        multiline
        maxRows={30}
        size="small"
        onChange={(e: any) => setBio(e.target.value)}
        value={bio}
      />
      <div className="submit">
        <Button variant="contained" onClick={onSave} fullWidth>
          Save
        </Button>
      </div>
    </div>
  );
};

export default Profile;