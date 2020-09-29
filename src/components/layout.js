import React from 'react'
// Link,
import { useStaticQuery, graphql } from "gatsby"
// import { rhythm } from '../utils/typography'
import containerStyles from './layout.module.css'
export default ({ children }) => {
	const data = useStaticQuery(
		graphql`
	    query {
	      site {
	        siteMetadata {
	          title
	        }
	      }
	    }
	  `
	)
	return (
		<div className={containerStyles['layout_container']}>
			<div className={containerStyles['layout_header']}>
				<div className={containerStyles["header_title"]}>{data.site.siteMetadata.title}</div>
				<div>input</div>
				{/* <div className={containerStyles['link_list']}>
					<span className={containerStyles['link_item']}><Link to="/" >首页</Link></span>
					<span className={containerStyles['link_item']}><Link to="/about" >about</Link></span>
				</div> */}
			</div>
			<div className={containerStyles['layout_content']}>
				{children}
			</div>
		</div>
	)
}