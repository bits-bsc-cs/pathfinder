// data.js — all curriculum content; single source of truth

const CURRICULUM = {

  // All courses in the program
  courses: {

    "BCS ZC313": {
      title: "Introduction to Programming",
      units: 4,
      type: "core",
      description: "Basic representation of data and how to process data using the representation inside a computer. Techniques for specifying data, operations on data, and problem-solving using C programming language. Systematic techniques and approaches for constructing programs.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC219": {
      title: "Discrete Mathematics",
      units: 3,
      type: "foundation",
      description: "Sets & operations on sets; relations, functions, recursive functions, sequences and summations, mathematical induction, proof methods (direct, indirect, proof by contradiction), principle of inclusion & exclusion, pigeonhole principle; permutations and combinations; recurrence relations; basic algebraic structures and their applications. Introduction to graphs, properties and applications.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC230": {
      title: "Linear Algebra and Optimization",
      units: 3,
      type: "foundation",
      description: "Vector and matrix algebra, systems of linear algebraic equations and their solutions; eigenvalues, eigenvectors and diagonalization of matrices; formulation of linear programming problems, Simplex method, Big-M method, two phase method, sensitivity analysis, revised and dual Simplex methods.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC228": {
      title: "Introduction to Computing Systems",
      units: 3,
      type: "core",
      description: "This course teaches a beginner what a computer is and how it can be programmed. The course starts with basic building blocks required to understand the structure of a computer: numbers, bits, structures to implement operations on numbers, and structures to control the execution of commands by a computer. The course progresses to introduce logic gates, and combinational and sequential circuits. It introduces a simple processor design with a small instruction set architecture and basic assembly programming with that processor.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC111": {
      title: "Basic Electronics",
      units: 2,
      type: "foundation",
      description: "Course covers basic passive circuit elements, dependent and independent sources, network theorems, circuit analysis techniques and response of first and second order circuits. Semiconductors – operation of diodes, bipolar junction transistors and field effect transistors. Biasing techniques and transistors. Introduction to operational amplifiers and applications.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC151": {
      title: "Writing Practice",
      units: 3,
      type: "foundation",
      description: "Introduction to academic writing – purpose, type, features, originality, integrity and plagiarism; paragraph writing – structure, development of ideas, linking paragraphs together, introduction, opening sentence and conclusion; elements of writing – argument and discussion, cause and effect, comparison, generalizations, problems and solution, process writing, visual information, accuracy in writing, academic vocabulary, caution, conjunction/linkers/signposting, punctuation, passives, tense forms, summarizing and paraphrasing; writing models – e-mails (formal), short essays (2-paragraph essay, thesis statement), and reports (introduction, methods, results, conclusion, abstract).",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 1
    },

    "BCS ZC311": {
      title: "Data Structures and Algorithms",
      units: 4,
      type: "core",
      description: "Introduction to asymptotic notations, solving recurrences (substitution method, iteration method, master theorem), abstract data types, linear data structures (stacks, queues, and linked lists), non-linear data structures – heap, hash tables, binary search trees, balanced binary search trees, sorting algorithms (insertion sort, selection sort, merge sort), graph data structures (adjacency list and adjacency matrix), graph traversal algorithms, topological sort, strongly connected components.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 2
    },

    "BCS ZC316": {
      title: "Object Oriented Programming",
      units: 4,
      type: "core",
      description: "Object orientation concepts, theories and principles; fundamental concepts of the object model: classes, objects, methods and messages, encapsulation and inheritance, interface and implementation, reuse and extension of classes, inheritance and polymorphism; overloading and overriding; static and dynamic binding; multithreaded programming; event handling and exception handling; process of object oriented requirements specification, analysis and design; notations for object-oriented analysis and design; case studies and applications using some object oriented programming languages. Object Oriented Design Patterns: Behavioral, Structural and Creational.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 2
    },

    "BCS ZC215": {
      title: "Command Line Interfaces and Scripting",
      units: 3,
      type: "core",
      description: "Files and directory, internals of a file system, inode structure, block I/O; file commands, pipes and filters, programming with commands; shell and interpretation of commands, programming with shell scripts, feature usage, interaction with I/Os; systems calls, usage with C programming, file system and I/O calls.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 2
    },

    "BCS ZC233": {
      title: "Probability and Statistics",
      units: 3,
      type: "foundation",
      description: "Probability spaces; conditional probability and independence; random variables and probability distributions; marginal and conditional distributions; independent random variables; mathematical expectation; mean and variance; binomial, Poisson and normal distributions; sum of independent random variables; law of large numbers; central limit theorem (without proof); sampling distribution and test for mean using normal and Student's t-distribution; test of hypothesis; correlation and linear regression.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 2
    },

    "BCS ZC112": {
      title: "Introduction to Logic",
      units: 2,
      type: "foundation",
      description: "Propositional logic – syntax, semantics, natural deduction, satisfiability & validity; predicate or first order logic – syntax, semantics, proof theory, satisfiability & validity, completeness & compactness, proof techniques; undecidability & incompleteness; Gödel's incompleteness theorem; overview of applications in program verification, knowledge representation.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 2
    },

    "BCS ZC212": {
      title: "Algorithm Design",
      units: 3,
      type: "core",
      description: "Effective construction and analysis of algorithms. Understanding, application, and implementation of algorithm design techniques like divide-and-conquer, greedy, dynamic programming, and back-tracking. Worst case and average case analysis of algorithms. Basic notions of complexity classes – P, NP, and NP-complete and reduction.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 3
    },

    "BCS ZC317": {
      title: "Relational Databases",
      units: 4,
      type: "core",
      description: "Introduction to database management systems; file organization; data independence in databases; data modeling; data definition and manipulation; relational data model; relational algebra & relational calculus; structured query languages; database design techniques; functional dependencies & normalization; query processing and optimization; indexing techniques; transaction management – concurrency control and recovery; distributed databases; concepts of security and integrity in databases.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 3
    },

    "BCS ZC238": {
      title: "Web Programming",
      units: 3,
      type: "core",
      description: "Technologies related to web development and associated technologies that make the web work. Scripting languages like HTML, CSS and JavaScript; design of dynamic websites; both client-side and server-side scripting technologies; full-stack web development. Design and development of web applications, web applications that could query databases and fetch information over the network; development and testing of web applications.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 3
    },

    "BCS ZC236": {
      title: "Software Design Principles",
      units: 4,
      type: "core",
      description: "Software development lifecycle; role of high level and low level design in lifecycle. Object-Oriented abstraction and Object Oriented Design. Design for Reuse and Design for Change – Refactoring. Design Patterns – history of patterns in building architecture and relevance to software design, evolution of software design patterns and impact of using design patterns in lifecycle. Crosscutting concerns and aspects – Aspect Oriented Design. High-level design vs. low-level design. Basic architectural elements and styles – Layered Architectures and Event-Driven Architectures, MVC architecture in User Interfaces.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 3
    },

    "BCS ZC216": {
      title: "Computer Systems and Performance",
      units: 3,
      type: "core",
      description: "Processor architecture (Instruction Set Level) – different types of instructions: AL, memory access, branch/jump; straight line programs vs. branches: different loop structures, performance of loops, nested conditionals, inner loops – examples; cost of procedure calls vs. goto statements; memory hierarchy: motivation – cost vs. size vs. access time; main memory and cache; write-through vs. write-back cache; access time calculation and hit ratio; locality of reference; paging (of main memory) and page faults, performance impact; procedure calls and space; hard disks and disk access (disk access time vs. RAM access time); disk I/O and file I/O, buffered vs. unbuffered I/O; performance: read vs. write vs. read-and-write; disk locality; sequential access vs. random access in files – examples; Flash/SSD storage: SSD access and access times; write limitations; flash file systems; performance impact.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 3
    },

    "BCS ZC232": {
      title: "Operating Systems",
      units: 3,
      type: "core",
      description: "Introduction to operating systems; various approaches to design of operating systems; overview of hardware support for operating systems; process/thread management: synchronization and mutual exclusion, inter-process communication, CPU scheduling approaches; memory management: paging, segmentation, virtual memory, page replacement algorithms; file systems: design and implementation of file systems; input/output systems; device controllers and device drivers; security and protection; case studies on design and implementation of operating system modules.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 4
    },

    "BCS ZC214": {
      title: "Building Database Applications",
      units: 3,
      type: "core",
      description: "This course discusses end-to-end application programming involving databases using SQL, PL/SQL, front-end framework, and exposing back-end through APIs. Debugging, testing, monitoring, documenting and maintaining database applications are discussed. Particular focus will be on database connectivity; stored procedures; data ingestion/loading; ingestion latency and query performance. This course culminates with a project that involves programming, implementing, and demonstrating a database solution for a business or organization.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 4
    },

    "BCS ZC234": {
      title: "Programming for Mobile Devices",
      units: 3,
      type: "core",
      description: "Introduction to mobile computing and emerging mobile application and hardware platforms; developing and accessing mobile applications; software lifecycle for mobile application – design and architecture, development – tools, techniques, frameworks, deployment; human factors and emerging human-computer interfaces (tangible, immersive, attentive, gesture, zero-input); select application domains such as pervasive health care, m-Health; mobile web browsing, gaming and social networking; trends in mobile application development.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 4
    },

    "BCS ZC220": {
      title: "Environmental Studies",
      units: 3,
      type: "foundation",
      description: "Environment, human population, and industrialization; natural resources and the impact of man-made activities on them; structure and function of ecosystem, population ecology, biodiversity and its conservation, environmental pollution, social issues and the environment, and environmental impact assessment.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 4
    },

    "BCS ZC222": {
      title: "Formal Languages and Applications",
      units: 3,
      type: "core",
      description: "Regular expressions, typical languages expressible using regular expressions – regular languages, closure properties; tokens or lexemes of languages (formal or natural) – token descriptions, scanning sentences or programs, scanner design and implementation. Applications: specifying patterns, test cases; context free grammars and rules, context free languages; defining the syntax of formal and natural languages; closure properties; limitations of CFGs – features not expressible via CFGs; context-sensitive grammars and languages; parsing sentences or programs. LL parsing vs LR parsing; lookaheads – LL(1) parsing, LL(1) parsing engine, and construction of LL(1) parsing table; LL(k) parsing examples and counterexamples; issues – ambiguity in CFGs and CFLs; resolving ambiguity – Left Factoring and Left Recursion. LR(1) parsing; application – natural language parsing and POS tagging.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 4
    },

    "BCS ZC211": {
      title: "Software Development Practices",
      units: 3,
      type: "core",
      description: "Review of use cases. Design using use cases and data flow; development tools and technologies – IDEs (Eclipse); compilers and compiler options, libraries and APIs; code reviews and walkthroughs; debugging and unit testing, runtime conditions and assertions; runtime environments (JVM, Android); code repositories (GitHub); versioning; CI/CD.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 5
    },

    "BCS ZC231": {
      title: "Network Programming and Client-Server Programming",
      units: 3,
      type: "core",
      description: "Overview of computer networks; inter-process communication; network programming; socket interface; client-server computing model: design issues, concurrency in server and clients; external data representation; remote procedure calls; network file systems; distributed systems design.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 5
    },

    "BCS ZC241T": {
      title: "Study Project",
      units: 5,
      type: "project",
      description: "In this course, students are expected to carry out an organized study and identify a problem which requires a software solution. Students also study the impacts of solving the problem and the existing solutions. At the end of the course, students submit a report with the project proposal, details on background, scope and solution methodology (including requirement specifications).",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 5
    },

    "BCS ZC428T": {
      title: "Project",
      units: 10,
      type: "project",
      description: "In this course, the students work to produce a software solution to a problem whose requirements were studied and documented in the Study Project course. The students will demonstrate their work and submit the detailed project report at the end of the semester.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: 6
    },

    "BCS ZC223": {
      title: "General Biology",
      units: 3,
      type: "science_elective",
      description: "Living systems and their properties; major biological compounds; basic physiological processes; introduction to genetics; environment and evolution.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BSC ZC240": {
      title: "General Physics",
      units: 3,
      type: "science_elective",
      description: "Philosophy of science; Newton's laws of motion; work energy, impulse and momentum; equilibrium; moment of a force; rotation; periodic motion; first law of thermodynamics; second law of thermodynamics; electromagnetic waves; interference and diffraction; polarization; relativistic mechanics; photons, electrons and atoms; quantum mechanics; atoms, molecules and solids; nuclear physics.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC113": {
      title: "Online Social Media",
      units: 2,
      type: "humanities_elective",
      description: "Social media – evolution, definition, classification, present social media landscape; different kinds of online community and social structure; benefits of social media for individuals, business and society; impacts of people and artificial intelligence on social media; impacts of social media – personal, professional, social aspects with cases; concerns (privacy, authenticity, informed consent, anonymity, risks), safety.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC114": {
      title: "Video Games – Technology and Social Impacts",
      units: 2,
      type: "humanities_elective",
      description: "Video games – introduction, play and game; deconstructing video games: narrative structures of videogames, critiquing rules in videogames, immersion and materiality; puzzles, drama and socio-technical system of video games; themes of videogames: violence, addiction, language, sexuality, gender, identity, communities, values and ethics; game genres: e-sports, indie games, serious games–gamification, game design.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC229": {
      title: "Introduction to Economics",
      units: 3,
      type: "social_science_elective",
      description: "Big ideas in economics; functioning of the economy; scarcity and choice; consumer behaviour; firm behaviour; competitive markets; labour markets; unemployment; capital market; banking and the non-banking financial institution; central banking; economic growth; inflation; monetary policy; fiscal policy.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC235": {
      title: "Science, Technology and Modernity",
      units: 3,
      type: "social_science_elective",
      description: "An interdisciplinary examination of the relationship between science, technology, and modern society. Topics include the historical development of modern science and its institutional structures; philosophical foundations of scientific knowledge and the nature of scientific explanation; the social construction of technology and its cultural dimensions; the role of innovation in economic and political change; ethical frameworks for evaluating emerging technologies; case studies drawn from computing, biotechnology, energy, and communications; and the responsibilities of technical professionals in a modern, technologically mediated world.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC224": {
      title: "Graphs and Networks",
      units: 3,
      type: "elective",
      description: "Basic concepts of graphs and digraphs, modelling problems from application domains as graph problems, connectedness, reachability, Euler tours, Hamiltonian cycles, planarity, applications; real world networks: measures (centrality, transitivity, reciprocity), properties and models (random networks, small world model, preferential attachment model), communities in social networks.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC213": {
      title: "Automata and Computability",
      units: 3,
      type: "elective",
      description: "Finite automata – DFA, equivalence of DFAs to regular expressions; PDA – DFA with a stack, equivalence of PDAs to CFLs; Turing machines – comparative power of DFAs, PDAs, and TMs; universal TM; brief overview of Chomsky's hierarchy and Church-Turing hypothesis; non-computable functions; informal equivalence between TMs and general purpose computers.",
      prereqs: ["BCS ZC222"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC221": {
      title: "Experimental Algorithmics",
      units: 3,
      type: "elective",
      description: "Review of time complexity, order of complexity, and Big-O notation; comparing theoretical analysis of time and space complexity of elementary algorithms (sorting, binary search trees, hash tables) with experimental running-time and space measurements. Experiments on key distribution: measuring heights of BSTs for different datasets and order of arrivals, uniformity of buckets/bins in hashtables with different hash functions; size experiments: growth of hash table size with datasets and query sequences, Bloom filter size vs. false positive rates, sketches and cardinality estimation via HyperLogLog. I/O complexity and disk access measurements: sorting, BSTs vs. B-Trees, sparse graphs vs. dense graphs. Caching in data structures. Case studies: use of B-Tree variants in datasets, Bloom filters in distributed file systems, and HyperLogLog in Redis.",
      prereqs: ["BCS ZC311", "BCS ZC212"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC227": {
      title: "Introduction to Bioinformatics",
      units: 3,
      type: "elective",
      description: "Course description has not yet been officially released.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC217": {
      title: "Data Visualization",
      units: 3,
      type: "elective",
      description: "Information overload and issues in decision making. Design of visual encoding schemes to improve comprehension of data and their use in decision making; presentation and visualization of data for effective communication. Elementary graphics programming, charts, graphs, animations, user interactivity, hierarchical layouts, and techniques for visualization of high dimensional data & discovered patterns.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC312": {
      title: "Introduction to Data Analytics",
      units: 4,
      type: "elective",
      description: "Introduction to data analytics, applications, Python fundamentals (variables, strings, simple math, conditional logic, for loops, lists, tuples, dictionaries, etc.); preparing the data – download the data in Python, visualizing using matplotlib and seaborn to gain insights, data cleaning, transformation; regression – applications, fitting models, gradient descent, evaluation, regularized models; classification – applications, fitting models (decision tree, logistic regression), addressing overfitting, performance, model selection techniques; clustering – applications, k-means and hierarchical clustering, quality of clustering; discussion on advanced topics; ethical implications of handling data and building models.",
      prereqs: ["BCS ZC230", "BCS ZC233", "BCS ZC313"],
      specialization: null,
      specializationHint: "Picking this course makes you eligible for the AIML specialization in the Honours program.",
      semesterFixed: null
    },

    "BCS ZC315": {
      title: "Multi-Core Programming and GPGPU Programming",
      units: 4,
      type: "elective",
      description: "Multi-threaded programming. Review of multicore processors and caching. Shared memory programming in the multi-core context – use of locks for synchronization. Shared memory data structures – synchronization issues and models, lazy synchronization, design of shared memory data structures. Review of GPGPU architecture and GPGPU programming model. Programming with many-core processors and NUMA. CUDA programming.",
      prereqs: ["BCS ZC216"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC237": {
      title: "TCP/IP and the Internet",
      units: 3,
      type: "elective",
      description: "Review of the OSI model and the Internet model; a top-down approach. Application layer – HTTP, HTTPS/TLS, DNS, and multi-media transport; the Internet – transport, TCP vs. UDP, routing, and gateways. IP – addressing and routing.",
      prereqs: ["BCS ZC231"],
      specialization: null,
      specializationHint: "Picking this course makes you eligible for the Cloud Computing specialization in the Honours program.",
      semesterFixed: null
    },

    "BCS ZC226": {
      title: "Information Security",
      units: 3,
      type: "elective",
      description: "Program security, web security, database security, protection in operating systems, cloud security fundamentals; privacy and anonymity in computing; legal and ethical issues in security, secure programming and trusted systems design; policy, administration and procedures; auditing; physical security; content protection.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC225": {
      title: "Human Computer Interaction",
      units: 3,
      type: "elective",
      description: "Principles of human-computer interaction; evaluation of user interfaces; usability engineering; task analysis, user-centred design, and prototyping; conceptual models and metaphors; software design rationale; design of windows, menus, and commands. Voice and natural language I/O; response time and feedback; color, icons, and sound; internationalization and localization; user interface architectures and APIs.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC218": {
      title: "Designing Multimodal Interfaces",
      units: 3,
      type: "elective",
      description: "UI design principles; GUI design; interfaces with multiple modes of interaction – text, graphics, and speech; identification and authentication: CAPTCHAs; smart cards; design of multi-factor authentication schemes; identification in personal devices – fingerprints, voice-print identification; design of interfaces for smart personal assistants; case study: Siri/Cortana, Alexa/Google Device. Design of chatbots with emphasis on the design of natural language interaction/conversations.",
      prereqs: ["BCS ZC316"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC314": {
      title: "Modern Databases",
      units: 4,
      type: "elective",
      description: "Different types of content – structured vs. unstructured vs. semi-structured data; notion of atomicity (or consistency): ACID vs. BASE; strong vs. weak consistency model; serializability; eventual consistency; CAP theorem and implications; solution models and design examples (some of MongoDB, REDIS, Cassandra, Neo4j); document stores, key-value stores, column stores, graph stores and languages for their query processing; in-memory databases, and cloud databases (e.g., Amazon RDS); exposure to application development.",
      prereqs: ["BCS ZC214"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BCS ZC242T": {
      title: "Project",
      units: 5,
      type: "project",
      description: "The students registered in this course will identify a problem which requires software-based solutions. The students will identify the details of the requirements, design the solution to the problem and implement it using any of the tools/techniques covered as a part of the program. The students will demonstrate their work and submit the detailed project report at the end of the semester.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC421": {
      title: "Introduction to Machine Learning",
      units: 4,
      type: "discipline_elective",
      description: "Foundations of machine learning: supervised, unsupervised, and reinforcement learning paradigms. Linear and logistic regression; decision trees and ensemble methods; support vector machines; neural network fundamentals; model evaluation, cross-validation, and hyperparameter tuning; bias-variance tradeoff; introduction to scikit-learn and practical ML pipelines.",
      prereqs: ["BCS ZC312"],
      specialization: "AIML",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC412": {
      title: "Artificial Intelligence",
      units: 3,
      type: "discipline_elective",
      description: "Core principles of artificial intelligence: state-space search and heuristics; A* and adversarial search; constraint satisfaction problems; knowledge representation and reasoning; propositional and first-order logic in AI systems; planning; introduction to probabilistic reasoning and Bayesian networks; overview of AI ethics and societal impact.",
      prereqs: ["BHCS ZC421"],
      specialization: "AIML",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC417": {
      title: "Deep Learning and Applications",
      units: 4,
      type: "discipline_elective",
      description: "Architectures and training of deep neural networks: feedforward networks, backpropagation, and optimization (SGD, Adam); convolutional neural networks for image tasks; recurrent neural networks and LSTMs for sequential data; attention mechanisms and transformers; regularization and batch normalization; transfer learning; practical applications in computer vision and natural language processing using frameworks such as PyTorch or TensorFlow.",
      prereqs: ["BCS ZC312"],
      specialization: "AIML",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC434": {
      title: "Topics in Data Mining",
      units: 4,
      type: "discipline_elective",
      description: "Techniques for discovering patterns in large datasets: data preprocessing and feature engineering; association rule mining (Apriori, FP-growth); classification and clustering at scale; anomaly detection; text mining and web mining; stream data mining; evaluation frameworks for mined patterns; ethical and privacy considerations in mining real-world datasets.",
      prereqs: ["BCS ZC312"],
      specialization: "AIML",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC414": {
      title: "Cloud Computing Fundamentals",
      units: 3,
      type: "discipline_elective",
      description: "Core concepts of cloud computing: service models (IaaS, PaaS, SaaS) and deployment models (public, private, hybrid); virtualization and containerization principles; cloud storage and compute abstractions; introduction to major cloud platforms (AWS, GCP, Azure); resource provisioning, auto-scaling, and cost management; cloud security fundamentals; SLAs and availability guarantees.",
      prereqs: ["BCS ZC237"],
      specialization: "Cloud",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC422": {
      title: "Introduction to Networking for Cloud",
      units: 3,
      type: "discipline_elective",
      description: "Networking concepts specific to cloud environments: virtual private clouds (VPCs) and subnets; load balancing and traffic routing; DNS in cloud contexts; content delivery networks; network security groups and firewall rules; VPNs and inter-region connectivity; latency and bandwidth considerations in distributed cloud architectures; hands-on exposure to cloud networking configuration.",
      prereqs: ["BHCS ZC414"],
      specialization: "Cloud",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC420": {
      title: "Introduction to DevOps for Cloud",
      units: 4,
      type: "discipline_elective",
      description: "Principles and practices of DevOps in cloud-native contexts: CI/CD pipeline design and implementation; infrastructure as code (Terraform, CloudFormation); containerization with Docker; orchestration with Kubernetes; monitoring, logging, and alerting in production systems; blue-green and canary deployments; site reliability engineering principles; cultural and organizational dimensions of DevOps adoption.",
      prereqs: ["BHCS ZC414"],
      specialization: "Cloud",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC430": {
      title: "Scalable Services in Cloud",
      units: 4,
      type: "discipline_elective",
      description: "Design and implementation of scalable cloud-native services: microservices architecture patterns; API gateway design; asynchronous messaging and event-driven architectures; data consistency in distributed systems; caching strategies; horizontal scaling and stateless service design; serverless computing models; performance testing and capacity planning for cloud services; case studies from production systems.",
      prereqs: ["BHCS ZC414"],
      specialization: "Cloud",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC413": {
      title: "Backend and API Development",
      units: 4,
      type: "discipline_elective",
      description: "Server-side application development: RESTful API design principles; HTTP methods, status codes, and headers; authentication and authorization (JWT, OAuth 2.0); database integration from the backend; input validation and error handling; middleware design; versioning and documenting APIs (OpenAPI/Swagger); introduction to GraphQL; performance considerations and rate limiting; backend testing strategies.",
      prereqs: [],
      specialization: "FullStack",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC419": {
      title: "Frontend Development",
      units: 3,
      type: "discipline_elective",
      description: "Modern frontend development practices: component-based UI architecture; state management patterns; the browser rendering pipeline; responsive design and accessibility in production interfaces; build tooling and asset optimization; working with REST and GraphQL APIs from the client; testing frontend applications; progressive web app concepts; performance profiling and optimization in the browser.",
      prereqs: ["BHCS ZC413"],
      specialization: "FullStack",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC415": {
      title: "Cross-Platform Applications",
      units: 3,
      type: "discipline_elective",
      description: "Development of applications that target multiple platforms from a shared codebase: design patterns for cross-platform compatibility; frameworks for mobile and desktop cross-platform development; handling platform-specific APIs and capabilities; UI consistency across platforms; packaging, distribution, and update mechanisms; performance tradeoffs versus native development; case studies in cross-platform application architecture.",
      prereqs: ["BHCS ZC419"],
      specialization: "FullStack",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC432": {
      title: "Software Deployment",
      units: 4,
      type: "discipline_elective",
      description: "End-to-end software deployment practices: deployment environments (development, staging, production); release engineering and versioning strategies; containerized deployments; zero-downtime deployment techniques; rollback strategies; environment configuration and secrets management; monitoring and observability post-deployment; incident response and post-mortem practices; deployment pipelines as code.",
      prereqs: ["BHCS ZC419"],
      specialization: "FullStack",
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC433": {
      title: "Topics in Algorithms and Complexity",
      units: 4,
      type: "discipline_elective",
      description: "Advanced algorithmic topics beyond undergraduate foundations: approximation algorithms for NP-hard problems; randomized algorithms and probabilistic analysis; online algorithms and competitive analysis; parameterized complexity; fixed-parameter tractable algorithms; algebraic algorithms; selected topics from recent algorithmic research; analysis of real-world algorithmic challenges in large-scale systems.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC324": {
      title: "Compiler Design",
      units: 4,
      type: "discipline_elective",
      description: "Principles of programming language translation: lexical analysis and scanner construction; context-free grammars and parsing (LL, LR); semantic analysis and type checking; intermediate code generation; symbol table management; code optimization techniques (local, global, loop); register allocation; runtime environments and memory layout; introduction to just-in-time compilation; use of compiler construction tools.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZG512": {
      title: "Network Security",
      units: 4,
      type: "discipline_elective",
      description: "Security principles applied to networked systems: threat models for network attacks; cryptographic protocols in network contexts (TLS, IPSec); firewalls, intrusion detection and prevention systems; denial-of-service attacks and mitigations; DNS and BGP security; wireless network security; VPN architectures; network forensics and traffic analysis; secure network design principles; current case studies in network security incidents.",
      prereqs: ["BCS ZC237"],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC321": {
      title: "Software Testing and Automation",
      units: 3,
      type: "discipline_elective",
      description: "Systematic approaches to software quality assurance: test levels (unit, integration, system, acceptance); black-box and white-box testing techniques; test-driven development; boundary value analysis and equivalence partitioning; mutation testing; automated test frameworks; continuous testing in CI/CD pipelines; performance and load testing; test coverage metrics; managing test suites in large codebases.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC418": {
      title: "Distributed Systems",
      units: 4,
      type: "discipline_elective",
      description: "Fundamentals of building and reasoning about distributed systems: models of distributed computation; time, clocks, and ordering of events; consistency models and the CAP theorem; consensus protocols (Paxos, Raft); distributed storage and replication; fault tolerance and failure detection; distributed transactions; coordination services; case studies of real-world distributed systems (Google Spanner, Apache Kafka, ZooKeeper).",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC319": {
      title: "Natural Language Processing",
      units: 3,
      type: "discipline_elective",
      description: "Computational approaches to human language: text preprocessing and representation (bag of words, TF-IDF, word embeddings); language models (n-gram, neural); part-of-speech tagging and parsing; named entity recognition; sentiment analysis; machine translation concepts; question answering and information retrieval; introduction to large language models and their architecture; ethical considerations in NLP systems.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC423": {
      title: "Introduction to Social Media Analytics",
      units: 4,
      type: "discipline_elective",
      description: "Methods for collecting, processing, and analysing social media data: APIs and data collection pipelines; network analysis of social graphs; content analysis and topic modelling; influence and diffusion models; sentiment and opinion mining on social media; bot detection and misinformation analysis; privacy and ethical constraints on social media research; visualization of social media insights; platform-specific considerations.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC416": {
      title: "Cryptography",
      units: 3,
      type: "discipline_elective",
      description: "Mathematical and practical foundations of cryptography: symmetric encryption (AES, stream ciphers); asymmetric encryption (RSA, elliptic curve cryptography); cryptographic hash functions and MACs; digital signatures and certificates; key exchange protocols (Diffie-Hellman); public key infrastructure; zero-knowledge proofs (introduction); cryptographic protocol design and analysis; common vulnerabilities and attacks on cryptographic implementations.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZG511": {
      title: "Agile Software Processes",
      units: 3,
      type: "discipline_elective",
      description: "Agile methodologies and their application in software teams: the Agile Manifesto and principles; Scrum framework (sprints, ceremonies, roles, artefacts); Kanban and lean software development; user story writing and backlog management; estimation techniques (story points, planning poker); agile testing and quality practices; scaling agile (SAFe, LeSS); retrospectives and continuous improvement; transitioning teams from waterfall to agile.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC429": {
      title: "Open Source Software",
      units: 4,
      type: "discipline_elective",
      description: "Principles and practice of open source software development: history and philosophy of open source; licensing models (GPL, MIT, Apache, Creative Commons); contributing to open source projects (code review, pull requests, issue tracking); community governance and maintainership; tooling ecosystems; building and publishing open source packages; security considerations in open source supply chains; business models around open source; case studies of major open source projects and foundations.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC427T": {
      title: "Mini Project",
      units: 5,
      type: "project",
      description: "A supervised, domain-specific project undertaken in the student's chosen specialization area. The student identifies a focused problem, designs and implements a software solution, and documents the work in a structured project report. The Mini Project is mandatory for all students pursuing a specialization and must be undertaken in the domain of the chosen specialization. Assessment is based on the software artefact, project report, and a demonstration.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC327": {
      title: "Introduction to Calculus",
      units: 3,
      type: "open_elective",
      description: "Limits, continuity, and differentiation of single-variable functions; rules of differentiation; applications of derivatives (optimization, related rates, curve sketching); introduction to integration; the Fundamental Theorem of Calculus; basic techniques of integration; applications of integrals. Designed for students who did not study calculus at the pre-university level.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC325": {
      title: "Differential Equations and Applications",
      units: 3,
      type: "open_elective",
      description: "Ordinary differential equations and their applications in science and engineering: first-order ODEs (separable, linear, exact); second-order linear ODEs with constant coefficients; systems of ODEs; Laplace transforms and their application to solving ODEs; introduction to partial differential equations; numerical methods for ODEs; modelling physical, biological, and engineering phenomena using differential equations.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC320": {
      title: "Numerical Analysis",
      units: 3,
      type: "open_elective",
      description: "Computational methods for mathematical problems: floating-point arithmetic and error analysis; root-finding methods (bisection, Newton-Raphson); interpolation and polynomial approximation; numerical differentiation and integration (trapezoidal rule, Simpson's rule, Gaussian quadrature); numerical solutions of linear systems (Gaussian elimination, LU decomposition, iterative methods); numerical solutions of ODEs (Euler, Runge-Kutta); condition numbers and stability.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC241": {
      title: "Microprocessors, Programming and Interfacing",
      units: 4,
      type: "open_elective",
      description: "Architecture and programming of microprocessors: internal architecture of a representative microprocessor; assembly language programming; instruction sets and addressing modes; interrupts and interrupt service routines; memory organisation and interfacing; I/O interfacing techniques (programmed I/O, DMA); interfacing with peripheral devices; introduction to embedded systems programming; case studies in microprocessor-based system design.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC328": {
      title: "Introduction to IoT",
      units: 4,
      type: "open_elective",
      description: "Fundamentals of the Internet of Things: IoT architecture and ecosystem; sensing and actuation; embedded programming for IoT devices; communication protocols (MQTT, CoAP, Zigbee, BLE); edge computing and fog computing concepts; IoT data management and cloud integration; security and privacy challenges in IoT; power management for constrained devices; case studies in smart home, industrial IoT, and healthcare applications.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC244": {
      title: "Accounting for Managers",
      units: 3,
      type: "open_elective",
      description: "Fundamentals of financial and management accounting for non-accounting professionals: accounting principles and the accounting cycle; preparation and interpretation of financial statements (balance sheet, income statement, cash flow statement); cost concepts and cost behaviour; budgeting and variance analysis; introduction to management accounting for decision making; financial ratio analysis; an overview of auditing and corporate governance.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC322": {
      title: "Corporate Finance",
      units: 3,
      type: "open_elective",
      description: "Core concepts in corporate financial management: time value of money; capital budgeting and investment appraisal (NPV, IRR, payback period); capital structure theory; cost of capital; dividend policy; sources of corporate financing; financial risk and return; working capital management; mergers and acquisitions overview; introduction to financial markets and instruments.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC323": {
      title: "Investment Management",
      units: 3,
      type: "open_elective",
      description: "Principles of investment analysis and portfolio management: risk and return; portfolio theory and diversification (Markowitz framework); the Capital Asset Pricing Model (CAPM); efficient market hypothesis; equity valuation methods; fixed income securities and bond valuation; derivatives overview (options, futures); mutual funds and ETFs; behavioural finance and its implications for investment decisions; introduction to algorithmic and quantitative investing.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    },

    "BHCS ZC243": {
      title: "Signals and Systems",
      units: 3,
      type: "open_elective",
      description: "Mathematical framework for the analysis of signals and systems: continuous and discrete-time signals; linear time-invariant systems; convolution; Fourier series and Fourier transform; frequency domain analysis; Laplace transform and z-transform; sampling theorem and aliasing; digital filter concepts (FIR, IIR); applications in communications, audio processing, and control systems; introduction to signal processing using software tools.",
      prereqs: [],
      specialization: null,
      specializationHint: null,
      semesterFixed: null
    }

  },

  // Semester structure: fixed courses, optional slots, elective slots
  semesters: {
    1: {
      label: "Semester I",
      units: 18,
      fixed: ["BCS ZC313", "BCS ZC219", "BCS ZC230", "BCS ZC228", "BCS ZC111", "BCS ZC151"],
      optionals: [],
      electives: []
    },

    2: {
      label: "Semester II",
      units: 19,
      fixed: ["BCS ZC311", "BCS ZC316", "BCS ZC215", "BCS ZC233", "BCS ZC112"],
      optionals: [
        {
          slotKey: "SCIENCE_ELECTIVE",
          label: "Science Elective",
          choices: ["BCS ZC223", "BSC ZC240"]
        }
      ],
      electives: []
    },

    3: {
      label: "Semester III",
      units: 19,
      fixed: ["BCS ZC212", "BCS ZC317", "BCS ZC238", "BCS ZC236", "BCS ZC216"],
      optionals: [
        {
          slotKey: "HUMANITIES_ELECTIVE",
          label: "Humanities Elective",
          choices: ["BCS ZC113", "BCS ZC114"]
        }
      ],
      electives: []
    },

    4: {
      label: "Semester IV",
      units: 18,
      fixed: ["BCS ZC232", "BCS ZC214", "BCS ZC234", "BCS ZC220", "BCS ZC222"],
      optionals: [],
      electives: [
        { slotKey: "DISCIPLINE_ELECTIVE_1", label: "Discipline Elective #1" }
      ]
    },

    5: {
      label: "Semester V",
      units: 17,
      fixed: ["BCS ZC211", "BCS ZC231", "BCS ZC241T"],
      optionals: [],
      electives: [
        { slotKey: "DISCIPLINE_ELECTIVE_2", label: "Discipline Elective #2" },
        { slotKey: "DISCIPLINE_ELECTIVE_3", label: "Discipline Elective #3" }
      ]
    },

    6: {
      label: "Semester VI",
      units: 16,
      fixed: ["BCS ZC428T"],
      optionals: [
        {
          slotKey: "SOCIAL_SCIENCE_ELECTIVE",
          label: "Social Science Elective",
          choices: ["BCS ZC229", "BCS ZC235"]
        }
      ],
      electives: [
        { slotKey: "DISCIPLINE_ELECTIVE_4", label: "Discipline Elective #4" }
      ],
      hasFork: true
    },

    7: {
      label: "Semester VII",
      units: 17,
      bschOnly: true,
      fixed: [],
      optionals: [],
      electives: [
        { slotKey: "DISC_ELECTIVE_SEM7_1",   label: "Discipline Elective" },
        { slotKey: "DISC_ELECTIVE_SEM7_2",   label: "Discipline Elective" },
        { slotKey: "OPEN_ELECTIVE_SEM7_1",   label: "Open Elective" },
        { slotKey: "OPEN_ELECTIVE_SEM7_2",   label: "Open Elective" },
        { slotKey: "DISC_OR_OPEN_SEM7",      label: "Discipline or Open Elective" },
        { slotKey: "DISC_ELECTIVE_SEM7_OPT", label: "Discipline Elective (optional)", optional: true }
      ]
    },

    8: {
      label: "Semester VIII",
      units: 17,
      bschOnly: true,
      fixed: [],
      optionals: [],
      electives: [
        { slotKey: "DISC_ELECTIVE_SEM8_1",   label: "Discipline Elective" },
        { slotKey: "DISC_ELECTIVE_SEM8_2",   label: "Discipline Elective" },
        { slotKey: "DISC_OR_MINI_SEM8",      label: "Discipline Elective or Mini Project" },
        { slotKey: "OPEN_OR_DISC_SEM8_1",    label: "Open or Discipline Elective" },
        { slotKey: "OPEN_OR_DISC_SEM8_2",    label: "Open or Discipline Elective" },
        { slotKey: "DISC_ELECTIVE_SEM8_OPT", label: "Discipline Elective (optional)", optional: true }
      ]
    }
  },

  // Course pools used to populate elective grids
  bscElectives: [
    "BCS ZC224", "BCS ZC213", "BCS ZC221", "BCS ZC227",
    "BCS ZC217", "BCS ZC312", "BCS ZC315", "BCS ZC237",
    "BCS ZC226", "BCS ZC225", "BCS ZC218", "BCS ZC314"
  ],

  disciplineElectives: [
    "BHCS ZC421", "BHCS ZC412", "BHCS ZC417", "BHCS ZC434",
    "BHCS ZC414", "BHCS ZC422", "BHCS ZC420", "BHCS ZC430",
    "BHCS ZC413", "BHCS ZC419", "BHCS ZC415", "BHCS ZC432",
    "BHCS ZC433", "BHCS ZC324", "BHCS ZG512", "BHCS ZC321",
    "BHCS ZC418", "BHCS ZC319", "BHCS ZC423", "BHCS ZC416",
    "BHCS ZG511", "BHCS ZC429", "BHCS ZC427T"
  ],

  openElectives: [
    "BHCS ZC327", "BHCS ZC325", "BHCS ZC320", "BHCS ZC241",
    "BHCS ZC328", "BHCS ZC244", "BHCS ZC322", "BHCS ZC323", "BHCS ZC243"
  ],

  specializations: {
    "AIML": {
      label: "Artificial Intelligence & Machine Learning",
      prereqCourses: ["BCS ZC312"],
      mandatoryCourses: ["BHCS ZC421", "BHCS ZC412", "BHCS ZC417", "BHCS ZC434"],
      miniProject: "BHCS ZC427T",
      description: "Develop expertise in machine learning, deep learning, data mining, and AI systems. This specialization is built on a foundation of data analytics and progresses through modern ML techniques to cutting-edge applications in computer vision, NLP, and beyond."
    },
    "Cloud": {
      label: "Cloud Computing",
      prereqCourses: ["BCS ZC237"],
      mandatoryCourses: ["BHCS ZC414", "BHCS ZC422", "BHCS ZC420", "BHCS ZC430"],
      miniProject: "BHCS ZC427T",
      description: "Master the design, deployment, and management of cloud-native systems. From cloud fundamentals and networking to DevOps practices and scalable service architectures, this track prepares you to build and operate production systems on major cloud platforms."
    },
    "FullStack": {
      label: "Full-Stack Development",
      prereqCourses: [],
      mandatoryCourses: ["BHCS ZC413", "BHCS ZC419", "BHCS ZC415", "BHCS ZC432"],
      miniProject: "BHCS ZC427T",
      description: "Build end-to-end software products. This specialization covers backend API development, modern frontend engineering, cross-platform application delivery, and professional deployment practices — the complete lifecycle of a production software application."
    }
  },

  // Unlisted prerequisites enforced alongside explicit ones
  implicitPrereqs: {
    "BCS ZC428T": ["BCS ZC241T"]
  }

};

// Validates referential integrity at startup; warns on dangling course code references.
function validateCurriculum() {
  const knownCodes = new Set(Object.keys(CURRICULUM.courses));
  const issues = [];

  function checkCode(code, context) {
    if (!knownCodes.has(code)) {
      issues.push(`Unknown course code "${code}" referenced in: ${context}`);
    }
  }

  for (const [semNum, semDef] of Object.entries(CURRICULUM.semesters)) {
    const ctx = `semesters[${semNum}]`;
    for (const code of semDef.fixed) {
      checkCode(code, `${ctx}.fixed`);
    }
    for (const optional of semDef.optionals) {
      for (const code of optional.choices) {
        checkCode(code, `${ctx}.optionals["${optional.slotKey}"].choices`);
      }
    }
  }

  for (const [code, courseDef] of Object.entries(CURRICULUM.courses)) {
    for (const prereqCode of courseDef.prereqs) {
      checkCode(prereqCode, `courses["${code}"].prereqs`);
    }
  }

  for (const [code, prereqList] of Object.entries(CURRICULUM.implicitPrereqs)) {
    checkCode(code, `implicitPrereqs (key)`);
    for (const prereqCode of prereqList) {
      checkCode(prereqCode, `implicitPrereqs["${code}"]`);
    }
  }

  for (const code of CURRICULUM.bscElectives) {
    checkCode(code, `bscElectives`);
  }
  for (const code of CURRICULUM.disciplineElectives) {
    checkCode(code, `disciplineElectives`);
  }
  for (const code of CURRICULUM.openElectives) {
    checkCode(code, `openElectives`);
  }

  for (const [specKey, specDef] of Object.entries(CURRICULUM.specializations)) {
    for (const code of specDef.prereqCourses) {
      checkCode(code, `specializations["${specKey}"].prereqCourses`);
    }
    for (const code of specDef.mandatoryCourses) {
      checkCode(code, `specializations["${specKey}"].mandatoryCourses`);
    }
    checkCode(specDef.miniProject, `specializations["${specKey}"].miniProject`);
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.warn(`[CURRICULUM VALIDATION] ${issue}`);
    }
  }
}

validateCurriculum();
