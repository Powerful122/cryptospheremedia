import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// --- CONFIGURATION ---
const BRAND_COLORS = {
  primary: '#00346e', // Dark Blue
  secondary: '#00418b', // Medium Blue
  accent: '#006fc6', // Bright Blue (for buttons)
  background: '#fdf9f3', // Off-White
};

// Global variables for Firebase access provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- FIREBASE INITIALIZATION ---
let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// --- CONSTANTS ---
const CONTENT_CATEGORIES_OVERLAY = `
Marketing & Outreach Content
This content is designed to attract, engage, and convert a broad audience.

**Blog Posts / Articles:**
* Educational: "DeFi 101," "What is RWA Tokenization," or "How Lending Protocols Use Oracles."
* SEO-Focused: Targeting high-volume search terms like "best DeFi yield" or "tokenized real estate platforms."
* Thought Leadership: Commentary on market trends, regulatory changes, or the future of decentralized finance.

**Social Media Posts (Tweets/X Posts, LinkedIn, Telegram):**
* Threads: Long-form, sequential posts breaking down complex protocol updates, tokenomics, or market analysis.
* Daily Engagement: Short, punchy posts, questions, and replies to drive community interaction.
`;

// Simple Base64 placeholder for the logo
const LOGO_BASE64 = "data:image/png;base64,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";

// --- HELPERS ---
const Loading = () => (
    <div className="flex justify-center items-center py-10">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Data...
    </div>
);

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
  const [posts, setPosts] = useState([]);
  const [dbInstance, setDbInstance] = useState(null);
  const [authInstance, setAuthInstance] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isWriterMode, setIsWriterMode] = useState(false); // Admin/Writer mode state
  const [showContentModal, setShowContentModal] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Tweet');

  const contentCollectionPath = useMemo(() => `/artifacts/${appId}/public/data/social_posts`, [appId]);

  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    const initializeFirebase = async () => {
      if (!app || !db || !auth) {
        console.error("Firebase is not configured correctly.");
        return;
      }
      setDbInstance(db);
      setAuthInstance(auth);

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(auth, initialAuthToken);
            } else {
              await signInAnonymously(auth);
            }
          } catch (error) {
            console.error("Authentication failed:", error);
          }
        }
        
        // This is the user ID. We use the UID if logged in, or a unique ID otherwise.
        const currentUserId = auth.currentUser?.uid || crypto.randomUUID();
        setUserId(currentUserId);
        setIsAuthReady(true);
        // Assume 'admin' or a specific UID is the writer. For simplicity, we use the custom token UID as the admin.
        // In a real app, this would be based on roles.
        setIsWriterMode(currentUserId.includes('custom-token-uid')); // Heuristic for Admin check
      });

      return () => unsubscribe();
    };
    initializeFirebase();
  }, []);

  // 2. Real-Time Data Listener (Firestore)
  useEffect(() => {
    if (!isAuthReady || !dbInstance) return;

    // Fetch and listen to all public posts, ordered by creation time
    const postsQuery = query(collection(dbInstance, contentCollectionPath), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure comments and mockups are initialized correctly
        comments: doc.data().comments || [],
        mockupUrl: doc.data().mockupUrl || 'https://placehold.co/400x300/e0e0e0/000000?text=Mockup+Pending',
      }));
      setPosts(postsData);
    }, (error) => {
      console.error("Error listening to Firestore:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, dbInstance, contentCollectionPath]);

  // --- HANDLERS ---

  // Handle post creation and editing (Writer Only)
  const handleAddOrEditPost = async (e, postId = null) => {
    e.preventDefault();
    if (!newPostContent || !dbInstance) return;

    const postData = {
        content: newPostContent.trim(),
        category: newPostCategory,
        status: 'Pending',
        approvedBy: null,
        mockupUrl: 'https://placehold.co/400x300/e0e0e0/000000?text=Mockup+Pending',
        comments: [],
        lastUpdated: serverTimestamp(),
    };

    try {
        if (postId) {
            // Edit existing post
            await updateDoc(doc(dbInstance, contentCollectionPath, postId), postData);
            setShowContentModal(null); // Close modal after edit
        } else {
            // Add new post
            await setDoc(doc(collection(dbInstance, contentCollectionPath)), {
                ...postData,
                createdAt: serverTimestamp(),
            });
            setNewPostContent('');
        }
    } catch (error) {
        console.error("Error saving post:", error);
    }
  };

  // Handle post deletion (Writer Only)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
        await deleteDoc(doc(dbInstance, contentCollectionPath, postId));
    } catch (error) {
        console.error("Error deleting post:", error);
    }
  };

  // Handle client approval/disapproval (Client/Viewer)
  const handleApproval = async (postId, status) => {
    if (!dbInstance) return;
    try {
      await updateDoc(doc(dbInstance, contentCollectionPath, postId), {
        status: status,
        approvedBy: userId,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };
  
  // Handle adding a client comment (Client/Viewer)
  const handleAddComment = async (postId, commentText) => {
    if (!dbInstance || !commentText.trim()) return;

    // Simple structure to prevent complex nesting issues in Firestore
    const newComment = {
        id: crypto.randomUUID(),
        text: commentText.trim(),
        userId: userId, // Tracks which anonymous or custom user commented
        timestamp: new Date().toISOString(),
    };
    
    try {
        const postRef = doc(dbInstance, contentCollectionPath, postId);
        // Fetch current comments, append the new one, and update
        const currentPost = posts.find(p => p.id === postId);
        const updatedComments = [...(currentPost?.comments || []), newComment];

        await updateDoc(postRef, {
            comments: updatedComments,
            lastUpdated: serverTimestamp(),
        });

    } catch (error) {
        console.error("Error adding comment:", error);
    }
  };
  
  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Use toDate() for Firebase Timestamps or use directly if it's already a date string/object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // --- UI COMPONENTS ---

  const ApprovalButton = ({ postId, status, currentStatus, icon, color, label }) => (
    <button
      onClick={() => handleApproval(postId, status)}
      className={`flex items-center justify-center px-4 py-2 w-full font-bold text-white rounded-xl transition duration-200 ${
        currentStatus === status ? 'shadow-inner' : 'hover:opacity-90'
      }`}
      style={{ backgroundColor: color }}
    >
      {currentStatus === status ? <span className="mr-2">✓</span> : <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
  
  const CommentForm = ({ postId }) => {
    const [comment, setComment] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddComment(postId, comment);
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add client opinion here..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                rows="2"
            />
            <button
                type="submit"
                style={{ backgroundColor: BRAND_COLORS.secondary }}
                className="mt-2 px-4 py-2 text-white font-semibold rounded-lg hover:bg-opacity-90 transition"
            >
                Submit Comment
            </button>
        </form>
    );
  };

  const ContentModal = ({ post }) => {
    const [commentInput, setCommentInput] = useState('');

    useEffect(() => {
        if (post) {
            setCommentInput('');
        }
    }, [post]);

    if (!post) return null;

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        handleAddComment(post.id, commentInput);
        setCommentInput('');
    };

    const isPending = post.status === 'Pending';
    const isApproved = post.status === 'Approved';
    const isRejected = post.status === 'Rejected';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={() => setShowContentModal(null)}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" 
                style={{ backgroundColor: BRAND_COLORS.background }}
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                        {post.category} Post Review
                    </h2>
                    <button onClick={() => setShowContentModal(null)} className="text-gray-500 hover:text-gray-900 text-3xl font-light leading-none">
                        &times;
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: Content & Approval */}
                    <div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-semibold text-gray-500 mb-2">Post Copy (Click to copy)</p>
                            <div 
                                className="whitespace-pre-wrap font-medium cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition border border-dashed"
                                onClick={() => {
                                    document.execCommand('copy');
                                    alert('Content copied to clipboard!');
                                }}
                            >
                                {post.content}
                            </div>
                            <p className="mt-4 text-xs text-gray-400">
                                Created: {formatDate(post.createdAt)} | Last Updated: {formatDate(post.lastUpdated)}
                            </p>
                            {isWriterMode && (
                                <button 
                                    onClick={() => {
                                        setNewPostContent(post.content);
                                        setNewPostCategory(post.category);
                                        // Keeping the modal open and changing to edit state is complex, so let's simplify:
                                        alert("Please use the 'Edit' button in the main card view for now. Advanced in-modal editing requires more complex state management.");
                                    }}
                                    style={{ backgroundColor: BRAND_COLORS.accent }}
                                    className="mt-3 px-3 py-1 text-sm text-white rounded-lg hover:opacity-90"
                                >
                                    Edit Post
                                </button>
                            )}
                        </div>
                        
                        {/* Approval Box */}
                        <div className="mt-6 p-4 rounded-xl shadow-lg border-2" style={{ backgroundColor: BRAND_COLORS.background, borderColor: isApproved ? 'rgb(34 197 94)' : isRejected ? 'rgb(239 68 68)' : '#ccc' }}>
                            <p className="font-bold mb-3 text-lg" style={{ color: BRAND_COLORS.primary }}>Client Actions</p>
                            <div className="grid grid-cols-2 gap-3">
                                <ApprovalButton 
                                    postId={post.id} 
                                    status="Approved" 
                                    currentStatus={post.status} 
                                    icon="👍" 
                                    color="rgb(34 197 94)" 
                                    label="Approve (Go!)"
                                />
                                <ApprovalButton 
                                    postId={post.id} 
                                    status="Rejected" 
                                    currentStatus={post.status} 
                                    icon="👎" 
                                    color="rgb(239 68 68)" 
                                    label="Disapprove (Stop!)"
                                />
                            </div>
                            <div className="mt-3 text-sm text-center text-gray-600">
                                Status: <span className={`font-semibold ${isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-yellow-600'}`}>{post.status}</span>
                                {post.approvedBy && post.status !== 'Pending' && <span className="ml-2">by {post.approvedBy.substring(0, 8)}...</span>}
                            </div>
                        </div>

                    </div>
                    
                    {/* RIGHT COLUMN: Mockup & Comments */}
                    <div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-500 mb-2">Mockup Graphic</p>
                            <div className="bg-white border rounded-xl overflow-hidden shadow-md h-64 flex items-center justify-center">
                                {/* In a real app, this would be a proper image upload service */}
                                <img src={post.mockupUrl} alt="Mockup" className="object-cover w-full h-full" />
                            </div>
                            {isWriterMode && (
                                <p className="mt-2 text-xs text-gray-500">Note: Mockup upload functionality is not built into this one-file app. Use a third-party service and paste the URL into the 'Edit Post' field.</p>
                            )}
                        </div>

                        {/* Comment Box */}
                        <div className="mt-6 p-4 bg-white rounded-xl shadow-md border border-gray-200">
                            <h3 className="font-bold mb-2" style={{ color: BRAND_COLORS.primary }}>Comments</h3>
                            <div className="space-y-3 max-h-40 overflow-y-auto">
                                {post.comments.length > 0 ? (
                                    post.comments.map((comment) => (
                                        <div key={comment.id} className="p-2 text-sm bg-gray-50 rounded-lg border">
                                            <p className="font-medium text-gray-700">{comment.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                — {comment.userId.substring(0, 8)}... on {new Date(comment.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No comments yet.</p>
                                )}
                            </div>
                            <CommentForm postId={post.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };
  
  const PostCard = ({ post }) => {
    const isApproved = post.status === 'Approved';
    const isRejected = post.status === 'Rejected';
    const isPending = post.status === 'Pending';
    
    // Determine border color based on status
    const borderColor = isApproved ? 'border-green-500' : isRejected ? 'border-red-500' : 'border-yellow-500';

    return (
        <div 
            className={`bg-white rounded-xl shadow-lg border-l-8 p-5 transition hover:shadow-xl ${borderColor}`}
            style={{ backgroundColor: BRAND_COLORS.background }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isApproved ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.status}
                    </span>
                    <span className="text-sm font-medium" style={{ color: BRAND_COLORS.secondary }}>
                        {post.category}
                    </span>
                </div>
                <p className="text-xs text-gray-400">Last: {formatDate(post.lastUpdated)}</p>
            </div>
            
            <p 
                className="text-gray-800 text-sm mb-4 cursor-pointer line-clamp-3 hover:text-gray-900 transition"
                onClick={() => setShowContentModal(post)}
            >
                {post.content}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <button
                    onClick={() => setShowContentModal(post)}
                    className="flex items-center text-sm font-semibold transition duration-200"
                    style={{ color: BRAND_COLORS.accent }}
                >
                    Review/Comment ({post.comments.length})
                </button>
                {isWriterMode && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                setNewPostContent(post.content);
                                setNewPostCategory(post.category);
                                setShowContentModal(post); // Re-use modal to display and copy details before editing elsewhere
                            }}
                            className="text-sm text-gray-500 hover:text-blue-500"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-sm text-gray-500 hover:text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const ContentCategoriesModal = () => (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={() => setShowCategoriesModal(false)}>
          <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" 
              style={{ backgroundColor: BRAND_COLORS.background }}
              onClick={e => e.stopPropagation()}
          >
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.primary }}>Content Categories Strategy</h2>
              <div className="whitespace-pre-wrap text-gray-700 text-sm">
                  {CONTENT_CATEGORIES_OVERLAY}
              </div>
              <button 
                  onClick={() => setShowCategoriesModal(false)}
                  className="mt-6 px-4 py-2 font-semibold text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: BRAND_COLORS.accent }}
              >
                  Close
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: BRAND_COLORS.background }}>
      
      {/* Header and Intro */}
      <div className="max-w-6xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <img src={LOGO_BASE64} alt="Powerful Logo" className="w-10 h-10 rounded-full" />
                <h1 className="text-3xl font-extrabold" style={{ color: BRAND_COLORS.primary }}>
                    {isWriterMode ? 'Writer Dashboard' : 'Client Approval Portal'}
                </h1>
            </div>
            <button
                onClick={() => setShowCategoriesModal(true)}
                className="px-4 py-2 font-semibold text-white rounded-lg transition hover:bg-opacity-90"
                style={{ backgroundColor: BRAND_COLORS.accent }}
            >
                See Our Content Categories
            </button>
        </div>
        
        <p className="text-sm text-gray-600 border-t pt-4">
          Welcome to the Content Approval Portal for **Powerful**. This streamlined interface allows for quick, clear feedback on social media posts. Review the content, check **Approve/Disapprove** below, and use the comment box for any specific edits or opinions.
        </p>
        <p className="mt-2 text-xs text-gray-500">
            Current User ID: <span className="font-mono text-xs">{userId || 'Loading...'}</span> (Your unique identifier for comments)
        </p>
      </div>

      {/* Writer Mode: Add New Post Form */}
      {isWriterMode && (
          <div className="max-w-6xl mx-auto mb-8 p-6 rounded-2xl shadow-xl" style={{ backgroundColor: BRAND_COLORS.secondary }}>
              <h2 className="text-xl font-bold mb-4 text-white">✍️ Add New Post</h2>
              <form onSubmit={handleAddOrEditPost} className="space-y-3">
                  <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Enter new social media copy here (e.g., Tweet, LinkedIn Post, etc.)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                      rows="3"
                      required
                  />
                  <div className="flex space-x-4">
                      <select
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value)}
                          className="p-3 border border-gray-300 rounded-lg"
                      >
                          {['Tweet', 'LinkedIn Post', 'Telegram', 'Blog Promo'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                      </select>
                      <button
                          type="submit"
                          className="px-6 py-3 font-bold text-white rounded-xl transition hover:opacity-90 flex-shrink-0"
                          style={{ backgroundColor: BRAND_COLORS.accent }}
                      >
                          Submit Post for Review
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* Post Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: BRAND_COLORS.primary }}>
            {posts.length} Posts Awaiting Review
        </h2>
        {isAuthReady ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        ) : (
            <Loading />
        )}
      </div>

      {/* Modals */}
      {showContentModal && <ContentModal post={showContentModal} />}
      {showCategoriesModal && <ContentCategoriesModal />}
    </div>
  );
};

export default App;
