export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-4xl card-bg rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">About Pendly</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">What Is Pendly?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Pendly is a donation platform that unites organizations and businesses with their communities through secure, open fundraising campaigns. I believe that each business deserves a chance, and each community has the potential to... no, I know each community can make an impact. Our platform makes fundraising easy, allowing businesses to create campaigns, set goals, and accept donations directly from supporters in just clicks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We&apos;re on a mission to democratize fundraising by providing businesses of all sizes with the tools they need to connect with their communities and raise funds for their projects, causes, or business needs. Whether you&apos;re a local restaurant looking to expand, a startup seeking funding, or a community organization raising money for a special project, Pendly makes it easy to share your story and receive support from those who believe in your vision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <h3 className="font-semibold text-blue-900 mb-2">Create Your Campaign</h3>
                <p className="text-gray-700">Set up your fundraising campaign with a beautiful story, goal, and optional reward tiers to incentivize donations.</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <h3 className="font-semibold text-blue-900 mb-2">Share & Connect</h3>
                <p className="text-gray-700">Share your campaign with your community through social media, email, or links to reach potential supporters.</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <h3 className="font-semibold text-blue-900 mb-2">Receive Funds</h3>
                <p className="text-gray-700">Get donations directly to your account with automatic 90/10 splits, transparent fees, and secure payment processing.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Why Choose Pendly?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔒 Secure & Transparent</h3>
                <p className="text-gray-700">Built on Stripe&apos;s secure payment infrastructure with transparent fee structures and real-time transaction tracking.</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Easy to Use</h3>
                <p className="text-gray-700">Simple, intuitive interface that makes creating and managing campaigns effortless for businesses of any size.</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🚀 Fast Setup</h3>
                <p className="text-gray-700">Get your campaign live in minutes with our streamlined setup process and instant payment processing.</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🤝 Community Focused</h3>
                <p className="text-gray-700">Designed to strengthen the bond between businesses and their communities through meaningful fundraising campaigns.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">About Adam</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                I&apos;m Adam Ghaly &mdash; the Founder, CEO, and Developer of Pendly. I&apos;m a high school student with a passion for entrepreneurship and computer engineering. I started Pendly because I&apos;ve always known that my small town of Goshen, NY, is full of generous people who want to support each other. I wanted to build a way for them to help local businesses and actually benefit in return.
              </p>
              
              <p>
                Computers and video games have been a big part of my life, and I&apos;m someone who learns best by teaching myself. Which is why I taught myself how to code. I spent time researching exactly how a site like this could work, not by taking shortcuts, but by genuinely learning and building from scratch.
              </p>
              
              <p>
                Even though I get lots of As in school, I&apos;ve had moments where I dropped into B+ territory. Although I do know that grades aren&apos;t everything, real-world experience matters. I wanted to do something different, something real. I&apos;ve tried dropshipping, freelancing, even game development in the past. Every time, the hardest part was staying motivated when no money was coming in. That&apos;s when it hit me: small businesses struggle the same way. Sometimes, they just need quick support to get going. That&apos;s what Pendly is for.
              </p>
              
              <p>
                I built a rewards system into the platform so people feel excited to give &mdash; and so businesses can show appreciation in return. I tried using website builders at first, but they just didn&apos;t give me the flexibility I needed. So I started from the bottom and built this project up.
              </p>
              
              <p>
                I&apos;m committed to seeing Pendly grow, and I&apos;m just as committed to seeing these small businesses thrive. I&apos;ll personally be checking in with businesses, sending emails, and making sure this platform actually helps. I care about making a real impact &mdash; even if Pendly stays small, that&apos;s fine, as long as it&apos;s helping people.
              </p>
              
              <p>
                I hope to improve the design of the site over time and make it more visually appealing based on user feedback. I also plan to expand the features &mdash; like eventually using barcodes for coupons. Right now, we use a QR code system to keep things simple for the businesses and donors. And yes, I&apos;d love to build a mobile app in the future, but right now my focus is making it super easy for people to donate.
              </p>
              
              <p>
                One quote I&apos;ve always loved is from Milton Berle:
              </p>
              
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-700 font-medium">
                &quot;If opportunity doesn&apos;t knock, build a door.&quot;
              </blockquote>
              
              <p>
                That&apos;s what Pendly, and every small business, is doing. They&apos;re stepping out of their comfort zone, taking a risk, and building something from scratch. They deserve support, just like anyone else.
              </p>
              
              <p>
                To all the people out there who want to build something of their own, I&apos;ll leave you with this:
              </p>
              
              <p className="font-medium text-blue-700">
                There will always be obstacles, but no matter how many, there will always be a reward at the end.
              </p>
              
              <div className="text-right mt-8">
                <span className="text-3xl text-blue-800" style={{ fontFamily: "'Great Vibes', cursive" }}>Adam Ghaly</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
} 