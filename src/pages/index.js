import React from "react"
import { css } from "@emotion/core"
import { Link, graphql } from "gatsby"
// import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import indexStyle from '../styles/index.module.css'
export default ({ data }) => {
  return (
    // <Layout>
    <div className={indexStyle['index_container']}>
      <div className={indexStyle['index_header']}>
        JIJIE
        </div>
      {/* <h4>总共{data.allMarkdownRemark.totalCount}篇</h4> */}
      <div className={indexStyle['list_container']}>
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <div key={node.id}>
            <Link to={node.fields.slug}>
              <h3>
                {node.frontmatter.title}{" "}— {node.frontmatter.date}
              </h3>
            </Link>
            <div className={indexStyle['brief']}>{node.excerpt}</div>

          </div>
        ))}
      </div>
    </div>
    // </Layout >
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD, ")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`