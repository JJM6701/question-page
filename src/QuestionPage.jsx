import React, { useEffect, useState, useMemo } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import styles from "./QuestionPage.module.css";

const FindQuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ title: "", tag: "", date: "" });
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, "posts"), where("type", "==", "question"));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const date = data.date?.toDate
          ? data.date.toDate()
          : new Date(data.date);
        return {
          ...data,
          id: doc.id,
          formattedDate: date.toISOString().split("T")[0],
        };
      });
      setQuestions(fetchedQuestions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredQuestions = useMemo(() => {
    const { title, tag, date } = debouncedFilters;
    return questions.filter((question) => {
      const matchesTitle = question.title
        .toLowerCase()
        .includes(title.toLowerCase());
      const matchesTag =
        question.tags &&
        question.tags.toLowerCase().includes(tag.toLowerCase());

      const matchesDate = !date || question.formattedDate === date;

      return matchesTitle && matchesTag && matchesDate;
    });
  }, [debouncedFilters, questions]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Find Questions</h2>

      <div className={styles.filter}>
        <input
          type="text"
          name="title"
          placeholder="Filter by title"
          value={filters.title}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="tag"
          placeholder="Filter by tag"
          value={filters.tag}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
      </div>

      <ul className={styles.questionList}>
        {filteredQuestions.map((question) => {
          const isExpanded = expandedQuestions.has(question.id);
          return (
            <li
              key={question.id}
              className={`${styles.card} ${isExpanded ? styles.expanded : ""}`}
              onClick={() => toggleExpand(question.id)}
            >
              <h3>{question.title}</h3>

              {isExpanded && (
                <>
                  <p>{question.description}</p>
                  <div className="details">
                    <p>
                      <strong>Tags:</strong> {question.tags}
                    </p>
                    <p>
                      <strong>Date:</strong> {question.formattedDate}
                    </p>
                  </div>
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(question.id);
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FindQuestionPage;
