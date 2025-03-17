import Link from 'next/link'
import BlogCard from './blog-card'
import { blogs, products, projects } from '@/content/article'
import { Separator } from './ui/separator'


export function BigProjects() {
  return (
    <div className='w-full'>
      <div className='mb-4 flex w-full flex-col items-start justify-center gap-2'>
        <h1 className='text-xl font-medium tracking-tight'>Projects</h1>
        <Separator />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {projects?.map((projects) => (
          <Link href={projects?.link} key={projects?.id}>
            <BlogCard title={projects?.title} description={projects?.description} image={projects?.image} />
          </Link>
        ))}
      </div>
      <Link className='my-4 flex w-full items-center justify-center rounded-md border py-2' href="/thoughts">
        See all projects
      </Link>
    </div>
  )
}


export function ProductionGradeProjects() {
  return (
    <div className='w-full'>
      <div className='mb-4 flex w-full flex-col items-start justify-center gap-2'>
        <h1 className='text-xl font-medium tracking-tight'>Products</h1>
        <Separator />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {products?.map((products) => (
          <Link href={products?.link} key={products?.id}>
            <BlogCard title={products?.title} description={products?.description} image={products?.image} />
          </Link>
        ))}
      </div>
      <Link className='my-4 flex w-full items-center justify-center rounded-md border py-2' href="/thoughts">
        See all products
      </Link>
    </div>
  )
}

export function SocialMedias() {
  return (
    <div className='w-full'>
      <div className='mb-4 flex w-full flex-col items-start justify-center gap-2'>
        <h1 className='text-xl font-medium tracking-tight'>Contents</h1>
        <Separator />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {blogs?.map((blog) => (
          <Link href={blog?.link} key={blog?.id}>
            <BlogCard title={blog?.name} description={blog?.description} image={blog?.image} />
          </Link>
        ))}
      </div>
      <Link className='my-4 flex w-full items-center justify-center rounded-md border py-2' href="/thoughts">
        See all contents
      </Link>
    </div>
  )
}
