import React, { useState } from "react";
import styles from "./NewPostPage.module.css";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const NewPostPage = () => {
  const [postType, setPostType] = useState("question");

  const handlePostTypeChange = (type) => {
    setPostType(type);
  };

  const handleSubmit = async (post, image) => {
    try {
      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "posts"), {
        ...post,
        imageUrl,
        date: new Date(),
      });
      alert("Post saved successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>New Post</h2>
      <div>
        <label className={styles.label}>
          <input
            type="radio"
            name="postType"
            value="question"
            checked={postType === "question"}
            onChange={() => handlePostTypeChange("question")}
            className={styles.radio}
          />
          Question
        </label>
        <label className={styles.label}>
          <input
            type="radio"
            name="postType"
            value="article"
            checked={postType === "article"}
            onChange={() => handlePostTypeChange("article")}
            className={styles.radio}
          />
          Article
        </label>
      </div>
      {postType === "question" ? (
        <QuestionForm handleSubmit={handleSubmit} />
      ) : (
        <ArticleForm handleSubmit={handleSubmit} />
      )}
    </div>
  );
};

const QuestionForm = ({ handleSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleFormSubmit = () => {
    const post = { title, description, tags, type: "question" };
    handleSubmit(post, image);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.subheader}>What do you want to ask or share?</h3>
      <input
        type="text"
        placeholder="Start your question with how, what, why, etc."
        className={styles.inputText}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Describe your problem"
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="text"
        placeholder="Add tags"
        className={styles.inputText}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="file"
        className={styles.fileInput}
        onChange={handleImageChange}
      />

      <button className={styles.button} onClick={handleFormSubmit}>
        Post
      </button>
    </div>
  );
};

const ArticleForm = ({ handleSubmit }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleFormSubmit = () => {
    const post = { title, abstract, content, tags, type: "article" };
    handleSubmit(post, image);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.subheader}>What do you want to share?</h3>
      <input
        type="text"
        placeholder="Enter a descriptive title"
        className={styles.inputText}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Enter a 1 paragraph abstract"
        className={styles.textarea}
        value={abstract}
        onChange={(e) => setAbstract(e.target.value)}
      ></textarea>
      <textarea
        placeholder="Enter the main article text"
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <input
        type="text"
        placeholder="Add tags"
        className={styles.inputText}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="file"
        className={styles.fileInput}
        onChange={handleImageChange}
      />

      <button className={styles.button} onClick={handleFormSubmit}>
        Post
      </button>
    </div>
  );
};

export default NewPostPage;
