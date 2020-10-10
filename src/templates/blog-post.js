import React from "react"
import { graphql } from "gatsby"
// import Layout from "../components/layout"
import { markdown } from 'markdown'
// var markdown = require("markdown").markdown;
console.log(markdown.toHTML("Hello *World*!"));
export default ({ data }) => {
  console.log(data)
  const post = data.markdownRemark
  return (
    // <Layout>
    <div className="container">
      <h1 style={{ marginBottom: '50px' }}>{post.frontmatter.title}</h1>
      <div className="markdown" dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
    // </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      rawMarkdownBody
      frontmatter {
        title
      }
    }
  }
`