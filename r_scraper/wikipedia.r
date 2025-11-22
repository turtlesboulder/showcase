library(polite)
library(rvest)
sink("result.txt")

url <- "https://en.wikipedia.org"
session <- bow(url)

# Random page here
# link <- "/wiki/Battle_of_Lake_Benacus"
link <- "/wiki/Stanisław_Udrzycki"

# Get to philosophy
target <- "/wiki/Philosophy"

path <- data.frame("url"=link)
i <- 0
while (i < 20 && !is.na(link)) {
  # Paste concatenates
  print(paste(i, link))

  # Change the directory. It looks like relative URL's work.
  page <- nod(session, link) %>%
    scrape()

  # Search for links that are immediate children of p's
  # which are immediate children of the main content
  body <- html_node(page, "body")
  text <- html_node(body, "#mw-content-text") %>%
    html_nodes(".mw-content-ltr > p > a")

  # Grab the first non null link
  for (possible_link in text) {
    link <- html_attr(possible_link, "href")
    if (!is.na(link)) break
  }
  i <- i + 1
  path <- rbind(path, link)

  # Check for victory
  if (link == target) {
    print(paste(i, "Achieved philosophy!"))
    break
  }
}

sink()
sink("path.txt")
print(path)
sink()