import classnames from 'classnames';
import { UsePagination, DOTS } from './UsePagination';
import "./PaginationStyle.css";


export default function Pagination(props) {

    const { onPageChange, totalCount, siblingCount = 1, currentPage = 1, pageSize, className } = props;

    const paginationRange = UsePagination({ currentPage, totalCount, siblingCount, pageSize });

    if (currentPage === 0 || paginationRange.length < 2) {
        return null;
    }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    let lastPage = paginationRange[paginationRange.length - 1];

    return (
        <ul className={classnames('pagination-container', { [className]: className })}>
            {paginationRange.map((pageNumber, i) => {
                if (pageNumber === DOTS) {
                    return <li className="pagination-item dots" key={i}>&#8230;</li>;
                }
                return (
                    <li className={classnames('pagination-item', {selected: pageNumber === currentPage })}
                        onClick={() => onPageChange(pageNumber)} key={i}>
                        {pageNumber}
                    </li>
                );
            })}
            <li className={classnames('pagination-item', { disabled: currentPage === 1 })}
                onClick={onPrevious} >
                <svg xmlns="http://www.w3.org/2000/svg" width="17.305" height="19.228" viewBox="0 0 17.305 19.228">
                    <path id="Polygon_4" data-name="Polygon 4" d="M7.866,3.147a2,2,0,0,1,3.5,0l6.215,11.187a2,2,0,0,1-1.748,2.971H3.4a2,2,0,0,1-1.748-2.971Z" transform="translate(0 19.228) rotate(-90)" fill="#454545"/>
                </svg>
            </li>
            <li className={classnames('pagination-item', { disabled: currentPage === lastPage })}
                onClick={onNext} >
                <svg xmlns="http://www.w3.org/2000/svg" width="17.305" height="19.228" viewBox="0 0 17.305 19.228">
                    <path id="Polygon_3" data-name="Polygon 3" d="M7.866,3.147a2,2,0,0,1,3.5,0l6.215,11.187a2,2,0,0,1-1.748,2.971H3.4a2,2,0,0,1-1.748-2.971Z" transform="translate(17.305) rotate(90)" fill="#454545"/>
                </svg>
            </li>
        </ul>
    );
}
