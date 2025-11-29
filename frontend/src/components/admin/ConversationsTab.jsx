import { FaComments, FaEnvelope, FaUser, FaClock, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

function ConversationsTab({
  conversations,
  selectedConversation,
  handleConversationClick,
  messagesRef,
  page,
  setPage,
  totalPages,
  totalConversations,
  conversationSortOrder,
  setConversationSortOrder
}) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <FaComments className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Conversations
              </h2>
              <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                {totalConversations} total conversations
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm font-medium hidden sm:inline mr-2" style={{ color: 'var(--color-text)' }}>
              Sort:
            </span>
            <button
              onClick={() => setConversationSortOrder("desc")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition-all ${conversationSortOrder === "desc"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              style={conversationSortOrder === "desc" ? {} : { color: 'var(--color-text)' }}
            >
              <FaSortAmountDown />
              <span className="hidden sm:inline">Newest First</span>
              <span className="sm:hidden">Newest</span>
            </button>
            <button
              onClick={() => setConversationSortOrder("asc")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition-all ${conversationSortOrder === "asc"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              style={conversationSortOrder === "asc" ? {} : { color: 'var(--color-text)' }}
            >
              <FaSortAmountUp />
              <span className="hidden sm:inline">Oldest First</span>
              <span className="sm:hidden">Oldest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Conversations List */}
        <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <FaEnvelope className="text-blue-500" />
            <span>All Conversations</span>
          </h3>

          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto p-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleConversationClick(conv)}
                className={`group p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-102 hover:shadow-lg ${selectedConversation?._id === conv._id ? 'shadow-md' : ''
                  }`}
                style={{
                  background: selectedConversation?._id === conv._id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'var(--color-secondary)',
                  color: selectedConversation?._id === conv._id ? 'white' : 'var(--color-text)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-xs sm:text-sm truncate flex-1 mr-2">{conv.item?.title || 'Untitled Item'}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${conv.item?.status === 'found' ? 'bg-green-100 text-green-700' :
                    conv.item?.status === 'lost' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {conv.item?.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs mb-2 opacity-80">
                  <FaUser className="shrink-0" />
                  <span className="truncate">{conv.participants.map((p) => p.name).join(", ")}</span>
                </div>

                <div className="text-xs opacity-70 flex items-start gap-2">
                  <FaClock className="shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    {conv.lastMessage?.content || "No messages yet"} • {" "}
                    {new Date(conv.lastMessage?.createdAt || 0).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            <span className="text-xs sm:text-sm font-medium px-2 sm:px-4 py-2 rounded-xl" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              Next
            </button>
          </div>
        </div>

        {/* Messages Panel */}
        <div className="rounded-2xl shadow-lg overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-3 sm:p-4 border-b-2" style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-bg)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                      <FaComments className="text-base sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-lg font-bold truncate" style={{ color: 'var(--color-text)' }}>
                        {selectedConversation.item?.title || 'Untitled Item'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs opacity-70 truncate" style={{ color: 'var(--color-text)' }}>
                        <FaUser className="shrink-0" />
                        <span className="truncate">{selectedConversation.participants.map((p) => p.name).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${selectedConversation.item?.status === 'found' ? 'bg-green-100 text-green-700' :
                      selectedConversation.item?.status === 'lost' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedConversation.item?.status}
                    </span>
                    <span className="text-xs opacity-70 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {selectedConversation.messages.length} msg{selectedConversation.messages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesRef}
                className="p-3 sm:p-4 h-[400px] sm:h-[600px] overflow-y-auto space-y-2 sm:space-y-3 custom-scrollbar"
                style={{ background: 'var(--color-bg)' }}
              >
                {selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((msg, index) => (
                    <div
                      key={msg._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className="p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ background: 'var(--color-secondary)' }}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          {/* Avatar */}
                          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                            {msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
                              <span className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--color-text)' }}>
                                {msg.sender?.name || 'Unknown User'}
                              </span>
                              <span className="text-xs opacity-60 flex items-center gap-1 whitespace-nowrap shrink-0" style={{ color: 'var(--color-text)' }}>
                                <FaClock className="text-[10px]" />
                                <span className="hidden sm:inline">
                                  {new Date(msg.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="sm:hidden">
                                  {new Date(msg.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed wrap-break-word" style={{ color: 'var(--color-text)' }}>
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3">
                      <FaEnvelope className="text-xl sm:text-2xl opacity-50" style={{ color: 'var(--color-text)' }} />
                    </div>
                    <p className="text-xs sm:text-sm opacity-70 text-center px-4" style={{ color: 'var(--color-text)' }}>
                      No messages in this conversation yet
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="border-2 rounded-xl p-8 sm:p-12 h-[400px] sm:h-[600px] flex flex-col items-center justify-center shadow-inner" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-bg)' }}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3 sm:mb-4">
                  <FaComments className="text-3xl sm:text-4xl opacity-50" style={{ color: 'var(--color-text)' }} />
                </div>
                <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  No Conversation Selected
                </p>
                <p className="text-xs sm:text-sm opacity-70 text-center px-4" style={{ color: 'var(--color-text)' }}>
                  Choose a conversation from the list to view its messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationsTab;
