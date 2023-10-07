import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return initialProps
  }

  render() {
    return (
      <Html className="dark">
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:200,400,500,700&display=swap"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;500;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="font-poppins dark:prose-invert">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
