using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

namespace Wedding.Common.Utility.Testing.TestChain
{
    // using Thycotic.Utility.Reflection;

    namespace Wedding.Common.TestChain
    {
        /// <summary>
        /// Test fixture used to ensure the existence of tests for classes/interfaces that require them.
        /// </summary>
        [TestFixture]
        public abstract class TestsRequiredFixture
        {
            /// <summary>
            /// Gets or sets the logic assemblies.
            /// </summary>
            /// <value>
            /// The logic assemblies.
            /// </value>
            protected Assembly[] LogicAssemblies { get; set; }

            /// <summary>
            /// Gets or sets the test assemblies.
            /// </summary>
            /// <value>
            /// The test assemblies.
            /// </value>
            public Assembly[] TestAssemblies { get; set; }

            /// <summary>
            /// Gets or sets the exempt testable classes.
            /// </summary>
            /// <value>
            /// The exempt testable classes.
            /// </value>
            public Type[] ExemptTestableTypes { get; set; }

            protected TestsRequiredFixture()
            {
                LogicAssemblies = Enumerable.Empty<Assembly>().ToArray();
                TestAssemblies = new[] { GetType().Assembly };
                ExemptTestableTypes = Enumerable.Empty<Type>().ToArray();
            }

            //Use TestInitialize to run code before running each test
            [SetUp]
            public void SetUp()
            {

            }

            [Test]
            public void AllTypesRequestingThatThereBeTestsWrittenShouldHaveUnitTests()
            {
                LogicAssemblies.Should().NotBeEmpty("logic assemblies are need to be able to scan for testable classes");

                var typesOfInterest = LogicAssemblies.SelectMany(a => a.GetTypes()).ToArray();

                //combine the classes with the interfaces they implement
                typesOfInterest =
                    typesOfInterest.Union(typesOfInterest.SelectMany(t => t.GetInterfaces())).Distinct().ToArray();

                var interfacesRequestingUnitTests = typesOfInterest
                    .Where(
                        type => type.IsInterface && type.IsDefined(typeof(UnitTestsRequiredAttribute), false))
                    .ToList();

                //attributes applied to interfaces don't get "inherited" by classes which implement them
                var typesImplicitelyRequestingUnitTestsViaInterface = typesOfInterest
                    .Where(
                        type => type.IsClass &&
                                interfacesRequestingUnitTests.Any(
                                    i => !i.IsGenericType ? i.IsAssignableFrom(type) : type.IsAssignableToGenericType(i)))
                    .ToList();

                //all classes that explicitly request unit tests
                var typesExplicitelyRequestingUnitTests = typesOfInterest
                    .Where(
                        type => type.IsClass && type.IsDefined(typeof(UnitTestsRequiredAttribute), true))
                    .ToList();

                //all types that are not marked as Obsolete
                var typesRequestingUnitTests =
                    typesImplicitelyRequestingUnitTestsViaInterface.Union(typesExplicitelyRequestingUnitTests)
                        .Where(type => !type.IsDefined(typeof(ObsoleteAttribute), false)).ToList();

                Console.WriteLine("Found {0} testable classes in {1}", typesRequestingUnitTests.Count, string.Join(" ", LogicAssemblies.Select(la => la.GetName().Name)));

                TestAssemblies.Should().NotBeEmpty("test assemblies are need to be able to scan for testing classes");

                //all types that are linked as unit testing
                var testingTypes = TestAssemblies.SelectMany(a => a.GetTypes())
                    .Where(type => type.IsClass && !type.IsAbstract && Attribute.IsDefined(type, typeof(UnitTestsForAttribute)))
                    .ToList();

                Console.WriteLine("Found {0} testing classes in {1}", testingTypes.Count, string.Join(" ", TestAssemblies.Select(la => la.GetName().Name)));

                var untestedTypes = new List<Type>();

                typesRequestingUnitTests.ForEach(type =>
                {
                    if (type.IsAbstract)
                    {
                        return;
                    }
                    if (!testingTypes.Any(tt =>
                    {
                        var attributes =
                            Attribute.GetCustomAttributes(tt)
                                .Where(a => a is UnitTestsForAttribute)
                                .Cast<UnitTestsForAttribute>();

                        return attributes.Any(unitTestsForAttribute => unitTestsForAttribute.Type == type);
                    }))
                    {
                        untestedTypes.Add(type);
                    }
                });

                untestedTypes = untestedTypes.Except(ExemptTestableTypes).ToList();
                if (!untestedTypes.Any())
                {
                    //all classes are tested
                    return;
                }

                Console.WriteLine("Found untested classes:");

                untestedTypes.OrderBy(i => i.FullName).ToList().ForEach(i => Console.WriteLine("- {0}", i.FullName));

                throw new AggregateException(string.Format("Found {0} untested classes", untestedTypes.Count),
                    untestedTypes.Select(ut => new ApplicationException(string.Format("{0} is not tested", ut))));

            }
        }
    }
}
