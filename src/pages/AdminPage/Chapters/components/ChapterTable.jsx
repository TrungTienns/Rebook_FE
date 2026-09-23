export default function ChapterTable({ 
  chapters, loading, totalPages, page, setPage, 
  search, setSearch, sort, setSort, 
  bookIdFilter, setBookIdFilter, booksList,
  openEditModal, handleDelete 
}) {
  return (
    <>
      <div className="filter-bar neo-box">
        <div className="filter-group search-box">
          <i className="fa-solid fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm theo tên chương..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="filter-group">
          <i className="fa-solid fa-book"></i>
          <select 
            value={bookIdFilter} 
            onChange={(e) => { setBookIdFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả sách</option>
            {booksList.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <i className="fa-solid fa-sort"></i>
          <select 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="desc">Mới nhất trước</option>
            <option value="asc">Cũ nhất trước</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fa-solid fa-spinner fa-spin fa-3x"></i></div>
      ) : (
        <div className="chapter-table-wrapper neo-box">
          <table className="neo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Sách</th>
                <th>Chương</th>
                <th>Tiêu Đề</th>
                <th>Tệp Truyện</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map(chap => (
                <tr key={chap.id}>
                  <td>#{chap.id}</td>
                  <td className="book-name-cell">
                    {chap.book?.coverImageUrl && <img src={chap.book.coverImageUrl} alt="cover" className="tiny-cover"/>}
                    <span>{chap.book?.title || 'N/A'}</span>
                  </td>
                  <td><b>{chap.chapterNumber}</b></td>
                  <td>{chap.title}</td>
                  <td>
                    <div className="lang-tags">
                      {chap.pdfUrl && <span className="tag tag-pdf-vi">PDF (VI)</span>}
                      {chap.pdfUrlEn && <span className="tag tag-pdf-en">PDF (EN)</span>}
                      {chap.epubUrl && <span className="tag tag-epub-vi">EPUB (VI)</span>}
                      {chap.epubUrlEn && <span className="tag tag-epub-en">EPUB (EN)</span>}
                      {!chap.pdfUrl && !chap.pdfUrlEn && !chap.epubUrl && !chap.epubUrlEn && <span className="tag tag-none">Trống</span>}
                    </div>
                  </td>
                  <td>
                    {chap.isVip ? <span className="tag tag-vip"><i className="fa-solid fa-crown"></i> VIP</span> : <span className="tag tag-free">Free</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => openEditModal(chap)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(chap.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {chapters.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">Không tìm thấy chương nào.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="page-info">Trang {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
