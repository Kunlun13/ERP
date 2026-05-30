import { Download, Trash2, Eye } from 'lucide-react';
import { getFileUrl, isImageFile, getFileExtension, formatFileSize, formatDate } from '../../utils/helpers';

export default function DocumentGallery({ documents, onDelete, showAsGallery = true }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  if (showAsGallery) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {isImageFile(doc.mimeType) ? (
              <img
                src={getFileUrl(doc.filePath)}
                alt={doc.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-300">
                    {getFileExtension(doc.fileName)}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <a
                href={getFileUrl(doc.filePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-primary-600 hover:text-white transition"
              >
                <Eye size={18} />
              </a>
              <a
                href={getFileUrl(doc.filePath)}
                download={doc.fileName}
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-primary-600 hover:text-white transition"
              >
                <Download size={18} />
              </a>
              <button
                onClick={() => onDelete(doc._id)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-600 hover:text-white transition"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="p-2 bg-white dark:bg-gray-800">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{doc.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.documentType}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr className="border-b border-gray-200 dark:border-gray-600">
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Document</th>
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Type</th>
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Size</th>
            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-200">Uploaded</th>
            <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {isImageFile(doc.mimeType) ? (
                    <img
                      src={getFileUrl(doc.filePath)}
                      alt={doc.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900 rounded text-xs font-bold text-primary-600 dark:text-primary-300">
                      {getFileExtension(doc.fileName)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</span>
                </div>
              </td>
              <td className="p-3 text-gray-600 dark:text-gray-400">{doc.documentType}</td>
              <td className="p-3 text-gray-600 dark:text-gray-400">{formatFileSize(doc.fileSize)}</td>
              <td className="p-3 text-gray-600 dark:text-gray-400">{formatDate(doc.createdAt)}</td>
              <td className="p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={getFileUrl(doc.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded transition"
                    title="View"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={getFileUrl(doc.filePath)}
                    download={doc.fileName}
                    className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded transition"
                    title="Download"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => onDelete(doc._id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
