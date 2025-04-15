import { NextPage } from "next";
import Head from "next/head";
import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";

interface UserImageData {
  userId: string;
  images: string[];
  processed: boolean;
  analysis?: {
    activity_name?: string;
    distance?: string;
    pace?: string;
    time?: string;
    moving_time?: string;
    date?: string;
    location?: string;
    achievements?: number;
    elevation_gain?: string;
    calories?: string;
    heart_rate?: string;
    rawText?: string;
    error?: string;
  }[];
}

interface ActivityData {
  activity_name?: string;
  distance?: string;
  pace?: string;
  moving_time?: string;
  elevation_gain?: string;
  calories?: string;
  heart_rate?: string;
  date?: string;
  location?: string;
}

const Home: NextPage = () => {
  const [formData, setFormData] = useState({
    userId: "",
    imageFiles: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [userImagesList, setUserImagesList] = useState<UserImageData[]>([]);

  // Load data from localStorage when component mounts
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("userImagesList");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserImagesList(parsedData);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  const saveToLocalStorage = (userId: string, newImages: string[]) => {
    try {
      // Get current data
      const existingData = localStorage.getItem("userImagesList");
      let usersList: UserImageData[] = existingData
        ? JSON.parse(existingData)
        : [];

      // Find if user already exists
      const userIndex = usersList.findIndex((item) => item.userId === userId);

      if (userIndex >= 0) {
        // Update existing user's images
        usersList[userIndex].images = [
          ...usersList[userIndex].images,
          ...newImages,
        ];
      } else {
        // Add new user
        usersList.push({
          userId,
          images: newImages,
          processed: false,
        });
      }

      // Save back to localStorage
      localStorage.setItem("userImagesList", JSON.stringify(usersList));

      // Update state
      setUserImagesList(usersList);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "imageFiles" && files && files.length > 0) {
      const fileArray = Array.from(files);
      setFormData({
        ...formData,
        imageFiles: fileArray,
      });
    } else if (name === "userId") {
      setFormData({
        ...formData,
        userId: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.userId.trim() === "" || formData.imageFiles.length === 0) {
      setMessage({
        type: "error",
        content: "Please enter a User ID and select at least one image",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", content: "" });

    try {
      const submitData = new FormData();
      submitData.append("userId", formData.userId);

      formData.imageFiles.forEach((file, index) => {
        submitData.append("imageFiles", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        // Get image names for localStorage
        const imageNames = formData.imageFiles.map((file) => file.name);

        // Save to localStorage
        saveToLocalStorage(formData.userId, imageNames);

        setMessage({
          type: "success",
          content:
            "Upload successful! Saved " +
            formData.imageFiles.length +
            " images.",
        });

        setFormData({
          ...formData,
          imageFiles: [],
        });

        const fileInput = document.getElementById(
          "imageFiles"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setMessage({
          type: "error",
          content: result.message || "An error occurred during upload",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        content: "An error occurred during upload",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    try {
      // Get current data
      const usersList = [...userImagesList].filter(
        (item) => item.userId !== userId
      );

      // Save back to localStorage
      localStorage.setItem("userImagesList", JSON.stringify(usersList));

      // Update state
      setUserImagesList(usersList);
    } catch (error) {
      console.error("Error removing user from localStorage:", error);
    }
  };

  const processImages = async (userId: string) => {
    setIsProcessing(userId);
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch(`/api/images?userId=${userId}`, {
        method: "POST",
      });

      const result = await response.json();
      console.log("Processing result:", result);
      if (response.ok && result.success) {
        // Update the user's processed status and analysis data
        const updatedUsersList = userImagesList.map((user) => {
          if (user.userId === userId) {
            // Parse the results if they exist
            let analysisData: any = [];

            if (result.data && result.data[userId]) {
              try {
                const userData = result.data[userId];
                analysisData = userData.analysis;
              } catch (error) {
                console.error("Error parsing analysis data:", error);
                analysisData = [{ error: "Could not parse analysis data" }];
              }
            }

            return {
              ...user,
              processed: true,
              analysis: analysisData,
            };
          }
          return user;
        });

        console.log("updatedUsersList", updatedUsersList);

        // Save the updated list to localStorage
        localStorage.setItem(
          "userImagesList",
          JSON.stringify(updatedUsersList)
        );

        // Update state
        setUserImagesList(updatedUsersList);

        setMessage({
          type: "success",
          content: "Image processing successful!",
        });
      } else {
        setMessage({
          type: "error",
          content:
            result.message || "An error occurred while processing images",
        });
      }
    } catch (error) {
      console.error("Image processing error:", error);
      setMessage({
        type: "error",
        content: "An error occurred while processing images",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>GPT-Scan-Strava</title>
        <meta name="description" content="GPT Scan Strava Application" />
        <link
          rel="icon"
          href="https://cdn.oaistatic.com/assets/favicon-miwirzcw.ico"
        />
      </Head>

      <main className="main">
        <h1 className="title">Welcome to GPT-Scan-Strava</h1>

        <p className="description">
          Hello! This is the Next.js page for your application
        </p>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Upload Images</h5>

            {message.content && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-danger"
                }`}
              >
                {message.content}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-3">
              <div className="mb-3">
                <label htmlFor="userId" className="form-label">
                  User ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Enter User ID"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="imageFiles" className="form-label">
                  Select multiple images
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="imageFiles"
                  name="imageFiles"
                  onChange={handleInputChange}
                  accept="image/*"
                  multiple
                  required
                />
                {formData.imageFiles.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Selected {formData.imageFiles.length} images
                    </small>
                    <ul className="list-group mt-2">
                      {formData.imageFiles.map((file, index) => (
                        <li
                          key={index}
                          className="list-group-item list-group-item-info"
                        >
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>

        {userImagesList.length > 0 && (
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">User and Image List</h5>

              <div className="list-group">
                {userImagesList.map((userData, userIndex) => (
                  <div key={userIndex} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">User ID: {userData.userId}</h6>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveUser(userData.userId)}
                      >
                        Delete
                      </button>
                    </div>

                    <p>Number of images: {userData.images.length}</p>

                    {userData.images.length > 0 && (
                      <div className="border p-2 bg-light">
                        <p className="mb-1">File list:</p>
                        <ul className="list-unstyled">
                          {userData.images.map((image, imgIndex) => (
                            <li key={imgIndex} className="small text-secondary">
                              {image}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!userData.processed && (
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => processImages(userData.userId)}
                        disabled={isProcessing === userData.userId}
                      >
                        {isProcessing === userData.userId
                          ? "Processing..."
                          : "Process Images"}
                      </button>
                    )}

                    {userData.processed && userData.analysis && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Analysis Results:</h6>
                          <span className="badge bg-success">Processed</span>
                        </div>

                        <div className="table-responsive">
                          <table className="table table-bordered table-sm">
                            <thead className="table-light">
                              <tr>
                                <th>Activity</th>
                                <th>Date</th>
                                <th>Distance</th>
                                <th>Pace</th>
                                <th>Moving Time</th>
                                <th>Location</th>
                                <th>Achievements</th>
                                <th>Elevation Gain</th>
                                <th>Calories</th>
                                <th>Heart Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(userData.analysis) ? (
                                userData.analysis.map(
                                  (item: any, index: number) => (
                                    <tr key={index}>
                                      <td>{item.activity_name || "-"}</td>
                                      <td>{item.date || "-"}</td>
                                      <td>{item.distance || "-"}</td>
                                      <td>{item.pace || "-"}</td>
                                      <td>{item.moving_time || "-"}</td>
                                      <td>{item.location || "-"}</td>
                                      <td>
                                        {item.achievements !== undefined
                                          ? item.achievements
                                          : "-"}
                                      </td>
                                      <td>{item.elevation_gain || "-"}</td>
                                      <td>{item.calories || "-"}</td>
                                      <td>{item.heart_rate || "-"}</td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td colSpan={10} className="text-center">
                                    No analysis data available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
